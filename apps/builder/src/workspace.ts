import * as fs from 'node:fs';
import * as path from 'node:path';

// ─── Constants ─────────────────────────────────────────────────────────────

export const BASE_PATH = '/tmp/shipyard';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Workspace {
  id: string;
  path: string;
  repoDirPath: string; // <workspace>/repo  — where git clone writes to
}

// ─── Create ────────────────────────────────────────────────────────────────
// Creates an isolated directory for one build job.
// Each call gets a UUID so concurrent builds never collide.

export function createWorkspace(): Workspace {
  const id = crypto.randomUUID();
  const workspacePath = path.join(BASE_PATH, id);
  const repoDirPath = path.join(workspacePath, 'repo');

  fs.mkdirSync(workspacePath, { recursive: true });
  // 0o777 — world-writable so any uid inside the container can write via the
  // volume mount. CAP_DAC_OVERRIDE is dropped (--cap-drop=ALL), which means
  // even root inside the container cannot bypass a 755 dir owned by a
  // different uid. Making it 777 lets any uid write without needing that cap.
  fs.chmodSync(workspacePath, 0o777);

  return { id, path: workspacePath, repoDirPath };
}

// ─── Cleanup ───────────────────────────────────────────────────────────────
// Deletes the entire workspace directory tree.
// Safe to call even if the path does not exist (force: true).
// Call this after the build output has been extracted / uploaded.

export function cleanupWorkspace(workspace: Workspace): void {
  try {
    fs.rmSync(workspace.path, { recursive: true, force: true });
  } catch (err) {
    // Non-fatal — files may be owned by root if the container ran as root.
    // The directory will be cleaned up on next system reboot or by a cron job.
    // This must never throw so a cleanup failure can't crash the server.
    console.warn(
      `[workspace] Failed to cleanup ${workspace.path}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

// ─── Output path ───────────────────────────────────────────────────────────
// Resolves the final output directory path on the HOST, after the container
// has finished writing to /workspace/repo/<outputDir> inside Docker.
// The volume mount makes both paths point to the same files.

export function resolveOutputPath(workspace: Workspace, outputDir: string): string {
  return path.join(workspace.repoDirPath, outputDir);
}
