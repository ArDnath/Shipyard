// ─── Build Configuration ───────────────────────────────────────────────────
// Passed from the API to the builder for every deployment request

export interface BuildConfig {
  repoUrl: string;
  branch: string;
  installCommand: string;
  buildCommand: string;
  outputDir: string;
  env: Record<string, string>;
}

// ─── Build Result ──────────────────────────────────────────────────────────
// Discriminated union — always check success before accessing other fields

export type BuildResult =
  | {
      success: true;
      buildId: string; // UUID of this build
      outputPath: string; // absolute path on host to the built output
      duration: number; // ms from start to container exit
      logs: string; // combined stdout + stderr from the container
    }
  | {
      success: false;
      buildId: string;
      error: string; // clean, human-readable error message
      logs: string; // whatever the container emitted before failing
    };
