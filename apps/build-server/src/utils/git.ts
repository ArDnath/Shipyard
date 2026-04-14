import * as fs from 'node:fs';
import * as path from 'node:path';
import { sanitizeGitHubUrl } from './validate';

// ─── Constants ─────────────────────────────────────────────────────────────

const CLONE_TIMEOUT_MS = 30_000; // 30 seconds max per clone
const BASE_PATH = path.join('/tmp', 'shipyard');

// ─── Types ─────────────────────────────────────────────────────────────────

export type CloneResult =
  | {
      success: true;
      cloneId: string;
      path: string;
      repoUrl: string;
      branch: string;
    }
  | {
      success: false;
      cloneId: string;
      error: string;
    };

// ─── Error parser ──────────────────────────────────────────────────────────
// Turns raw git stderr into a single clean sentence.
// Never leaks internal paths or tokens to the caller.

function parseGitError(stderr: string, timedOut: boolean): string {
  if (timedOut) {
    return `Clone timed out after ${CLONE_TIMEOUT_MS / 1000}s — repository may be too large or unreachable`;
  }

  const s = stderr.toLowerCase();

  if (s.includes('not found') && s.includes('repository')) {
    return 'Repository not found — verify the URL and that the repository is public';
  }
  if ((s.includes('remote branch') || s.includes('reference')) && s.includes('not found')) {
    return 'Branch not found on remote — check the branch name';
  }
  if (s.includes('could not resolve host')) {
    return 'Could not reach GitHub — check your network connection';
  }
  if (
    s.includes('authentication failed') ||
    s.includes('invalid username or password') ||
    s.includes('access denied')
  ) {
    return 'Authentication failed — only public repositories are supported';
  }
  if (s.includes('already exists') && s.includes('not an empty directory')) {
    return 'Clone destination already exists — this is a server-side conflict, please retry';
  }
  if (s.includes('early eof') || s.includes('the remote end hung up')) {
    return 'Connection dropped during clone — network error, please retry';
  }

  // Fallback: grab the first non-empty line after stripping the git prefix
  const clean = stderr
    .split('\n')
    .map((l) => l.replace(/^(fatal|error|warning):\s*/i, '').trim())
    .find((l) => l.length > 0);

  return clean ?? 'git clone failed for an unknown reason';
}

// ─── Cleanup helper ────────────────────────────────────────────────────────
// Call this after a build finishes to reclaim disk space.
// Safe to call even if the path does not exist.

export function cleanupClone(clonePath: string): void {
  fs.rmSync(clonePath, { recursive: true, force: true });
}

// ─── cloneRepo ─────────────────────────────────────────────────────────────

export async function cloneRepo(
  repoUrl: string,
  branch: string, // required — default lives in the Zod schema, not here
): Promise<CloneResult> {
  // Defense-in-depth: sanitize even though the middleware already validated
  const safeUrl = sanitizeGitHubUrl(repoUrl);

  // UUID → unique even under concurrent requests; no two jobs collide
  const cloneId = crypto.randomUUID();
  const projectPath = path.join(BASE_PATH, cloneId);

  fs.mkdirSync(BASE_PATH, { recursive: true });

  // Spawn git with an arguments array — no shell involved, no injection possible
  const proc = Bun.spawn(
    [
      'git',
      'clone',
      '--depth=1', // shallow: only the latest commit, no history
      '--single-branch', // only fetch the target branch, not all refs
      '--branch',
      branch,
      '--', // end-of-options: branch/path can't be mistaken for flags
      safeUrl,
      projectPath,
    ],
    {
      stdout: 'pipe',
      stderr: 'pipe',
    },
  );

  // Use a flag + clearTimeout rather than Promise.race to avoid
  // creating an unhandled rejection on the losing promise
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    proc.kill();
  }, CLONE_TIMEOUT_MS);

  try {
    const exitCode = await proc.exited;
    clearTimeout(timer);

    // ── Failure path ────────────────────────────────────────────────────────
    if (exitCode !== 0 || timedOut) {
      const stderr = await new Response(proc.stderr).text();

      // Remove any partial directory left behind so disk doesn't fill up
      fs.rmSync(projectPath, { recursive: true, force: true });

      return {
        success: false,
        cloneId,
        error: parseGitError(stderr, timedOut),
      };
    }

    // ── Remove .git directory ───────────────────────────────────────────────
    // The .git object store is the single biggest disk consumer after a clone:
    //   - it duplicates every file in the repo as loose objects
    //   - even with --depth=1 it can be 10–100 MB on an active repo
    // We don't need git history to run a build, so delete it immediately.
    const gitDir = path.join(projectPath, '.git');
    fs.rmSync(gitDir, { recursive: true, force: true });

    return {
      success: true,
      cloneId,
      path: projectPath,
      repoUrl: safeUrl,
      branch,
    };
  } catch (err) {
    clearTimeout(timer);

    // Clean up whatever was written before the error
    fs.rmSync(projectPath, { recursive: true, force: true });

    return {
      success: false,
      cloneId,
      error: err instanceof Error ? err.message : 'git clone failed',
    };
  }
}
