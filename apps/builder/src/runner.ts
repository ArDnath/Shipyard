import * as fs from 'node:fs';
import type { BuildConfig, BuildResult } from './types';
import { cleanupWorkspace, createWorkspace, resolveOutputPath } from './workspace';

const DOCKER_IMAGE = 'shipyard-builder';
const BUILD_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function parseRunnerError(
  stdout: string,
  stderr: string,
  exitCode: number,
  timedOut: boolean,
): string {
  if (timedOut) {
    return `Build timed out after ${BUILD_TIMEOUT_MS / 1000 / 60} minutes — try a lighter install or build command`;
  }

  const s = stderr.toLowerCase();

  // Docker-level errors (before the container even starts)
  if (s.includes('unable to find image') || s.includes('pull access denied')) {
    return `Docker image "${DOCKER_IMAGE}" not found — build it first: cd apps/builder && bun run docker:build`;
  }
  if (
    s.includes('cannot connect to the docker daemon') ||
    s.includes('is the docker daemon running')
  ) {
    return 'Docker daemon is not running — start Docker Desktop or the Docker service and retry';
  }
  if (s.includes('permission denied') && s.includes('docker.sock')) {
    return 'Permission denied on docker.sock — add your user to the docker group or run with sudo';
  }

  // OOM kill — Docker exits 137 when it kills the container for exceeding memory
  if (exitCode === 137) {
    return 'Build was killed — it exceeded the 1 GB memory limit. Try reducing dependencies.';
  }

  // Build-level errors (container started, something inside failed)
  if (s.includes('npm err') || s.includes('npm error')) {
    const npmLine = stderr
      .split('\n')
      .find((l) => /npm err/i.test(l))
      ?.replace(/^npm (err|error)!?\s*/i, '')
      .trim();
    return npmLine
      ? `npm error: ${npmLine}`
      : 'npm install or build failed — check your package.json';
  }
  if (s.includes('error: could not find') || s.includes('module not found')) {
    return 'Build failed — a module or file was not found. Check imports and package.json.';
  }
  if (s.includes('repository') && s.includes('not found')) {
    return 'Repository not found — verify the URL and that it is a public repository';
  }
  if ((s.includes('remote branch') || s.includes('reference')) && s.includes('not found')) {
    return 'Branch not found on remote — check the branch name';
  }
  if (s.includes('could not resolve host')) {
    return 'Could not reach GitHub inside container — check DNS and network settings';
  }

  // Check stdout for entrypoint-level error messages (e.g. output dir not found).
  // The entrypoint.sh writes "✖ ..." lines to stdout, not stderr.
  const entrypointError = stdout
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith('✖'));
  if (entrypointError) {
    return entrypointError.replace(/^✖\s*/, '');
  }

  // Fallback: scan stderr but skip known noise lines (npm notices, warnings,
  // baseline-browser-mapping advisories, etc.) so they don't masquerade as errors.
  const noisePrefixes = [
    'npm notice',
    'npm warn',
    '[baseline-browser-mapping]',
    'to address',
    'run `npm',
  ];
  const isNoise = (line: string) => {
    const lower = line.toLowerCase();
    return noisePrefixes.some((p) => lower.startsWith(p.toLowerCase()));
  };

  const lastMeaningfulLine = stderr
    .split('\n')
    .map((l) => l.replace(/^(fatal|error|warning):\s*/i, '').trim())
    .filter((l) => l.length > 0 && !isNoise(l))
    .at(-1);

  return lastMeaningfulLine ?? `Build failed with exit code ${exitCode}`;
}

// ─── runBuild ──────────────────────────────────────────────────────────────
// Orchestrates a full build:
//   1. Create isolated workspace on host  →  /tmp/shipyard/<uuid>
//   2. docker run with volume mount       →  /tmp/shipyard/<uuid>:/workspace
//   3. Inside container: clone → install → build
//   4. Verify output directory exists     →  /tmp/shipyard/<uuid>/repo/<outputDir>
//   5. Return path (caller uploads / extracts it, then calls cleanupWorkspace)

export async function runBuild(config: BuildConfig): Promise<BuildResult> {
  const workspace = createWorkspace();
  const buildId = workspace.id;
  const startTime = Date.now();

  // Separate log capture so we can always return logs regardless of success/failure
  let logs = '';

  try {
    // ── Build the docker run argument list ────────────────────────────────
    // Each value is a separate array element — no shell, no injection possible.

    // Get the host user's uid/gid so files written inside the container
    // are owned by the host user — not root. Without this, fs.rmSync
    // during cleanup throws EACCES because root-owned files can't be
    // deleted by a non-root process on the host.
    const uid = typeof process.getuid === 'function' ? process.getuid() : 1000;
    const gid = typeof process.getgid === 'function' ? process.getgid() : 1000;

    const dockerArgs: string[] = [
      'run',
      '--rm', // delete container on exit — no leftovers

      // ── Resource limits ─────────────────────────────────────────────────
      '--memory=2g', // hard cap — OOM kill at 2 GB (npm install for React/Vite/Next needs 1–1.5 GB)
      '--memory-swap=2g', // disable swap (same value = no swap)
      '--cpus=1.5', // cap at 1.5 cores
      '--pids-limit=200', // prevent fork bombs

      // ── Security hardening ───────────────────────────────────────────────
      '--security-opt=no-new-privileges', // child processes can't gain more privileges
      '--cap-drop=ALL', // drop ALL Linux capabilities by default
      // git clone + npm install work fine with zero capabilities

      // ── Run as host user ──────────────────────────────────────────────────
      // Files written to /workspace inside the container will be owned by
      // uid:gid on the host — so fs.rmSync cleanup works without sudo.
      '--user',
      `${uid}:${gid}`,

      // ── Filesystem ───────────────────────────────────────────────────────
      '--tmpfs',
      '/tmp:rw,noexec,nosuid,size=256m', // writable /tmp inside container
      '-v',
      `${workspace.path}:/workspace`, // mount the build workspace

      // ── HOME override ─────────────────────────────────────────────────────
      // npm, yarn, and bun all write cache/config files to $HOME.
      // Without this, they try to write to /root or a non-existent homedir
      // and fail with EACCES. Pointing HOME at /workspace keeps everything
      // inside the mounted volume and gets cleaned up automatically.
      '-e',
      'HOME=/workspace',

      // ── Required build environment variables ─────────────────────────────
      '-e',
      `REPO_URL=${config.repoUrl}`,
      '-e',
      `BRANCH=${config.branch}`,
      '-e',
      `INSTALL_COMMAND=${config.installCommand}`,
      '-e',
      `BUILD_COMMAND=${config.buildCommand}`,
      '-e',
      `OUTPUT_DIR=${config.outputDir}`,

      // ── User-supplied env vars (injected into the build) ──────────────────
      ...Object.entries(config.env).flatMap(([k, v]) => ['-e', `${k}=${v}`]),

      DOCKER_IMAGE,
    ];

    const proc = Bun.spawn(['docker', ...dockerArgs], {
      stdout: 'pipe',
      stderr: 'pipe',
    });

    // ── Timeout ──────────────────────────────────────────────────────────
    // Kill the container if the build runs too long.
    // We use a flag + clearTimeout rather than Promise.race to avoid
    // creating an unhandled rejection on the losing promise.

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill();
    }, BUILD_TIMEOUT_MS);

    const exitCode = await proc.exited;
    clearTimeout(timer);

    // Collect logs — always, so we can return them on both success and failure
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    logs = [stdout, stderr].filter(Boolean).join('\n').trim();

    // ── Failure path ──────────────────────────────────────────────────────
    if (exitCode !== 0 || timedOut) {
      cleanupWorkspace(workspace);
      return {
        success: false,
        buildId,
        error: parseRunnerError(stdout, stderr, exitCode ?? 1, timedOut),
        logs,
      };
    }

    // ── Verify output exists ──────────────────────────────────────────────
    // The container should have written the build output to:
    //   /workspace/repo/<outputDir>  (inside container)
    //   /tmp/shipyard/<id>/repo/<outputDir>  (on host, same files via volume)

    const outputPath = resolveOutputPath(workspace, config.outputDir);

    if (!fs.existsSync(outputPath)) {
      cleanupWorkspace(workspace);
      return {
        success: false,
        buildId,
        error: `Build exited successfully but output directory "${config.outputDir}" was not created. Check your buildCommand.`,
        logs,
      };
    }

    // ── Success ───────────────────────────────────────────────────────────
    // We DO NOT clean up here — the caller needs to read/upload the output first.
    // The caller is responsible for calling cleanupWorkspace(workspace) when done.

    const duration = Date.now() - startTime;

    return {
      success: true,
      buildId,
      outputPath,
      duration,
      logs,
    };
  } catch (err) {
    // Unexpected error (e.g. Bun.spawn failed because docker binary is missing)
    cleanupWorkspace(workspace);
    return {
      success: false,
      buildId,
      error: err instanceof Error ? err.message : 'Unexpected error during build',
      logs,
    };
  }
}
