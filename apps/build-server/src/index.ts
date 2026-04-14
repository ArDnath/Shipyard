import { Hono } from 'hono';
import { runBuild } from '../../builder/src/index';
import { validateBody } from './middleware/validate';
import { cloneRepo } from './utils/git';
import { deploySchema } from './utils/validate';
import type { DeployInput } from './utils/validate';

const app = new Hono();

// ─── Health check ──────────────────────────────────────────────────────────

app.get('/', (c) => {
  return c.json({ status: 'ok', service: 'Shipyard API' });
});

// ─── POST /clone ───────────────────────────────────────────────────────────
// Lightweight route — just clones the repo to /tmp/shipyard/<uuid>.
// Useful for debugging and verifying URL/branch before a full build.

app.post('/clone', validateBody(deploySchema), async (c) => {
  const body = c.get('validatedBody') as DeployInput;

  const result = await cloneRepo(body.repoUrl, body.branch);

  if (!result.success) {
    return c.json(
      {
        cloneId: result.cloneId,
        error: result.error,
      },
      500,
    );
  }

  return c.json(
    {
      cloneId: result.cloneId,
      path: result.path,
      repoUrl: result.repoUrl,
      branch: result.branch,
    },
    201,
  );
});

// ─── POST /deploy ──────────────────────────────────────────────────────────
// Full build pipeline:
//   1. Validate request body
//   2. Create isolated workspace  → /tmp/shipyard/<uuid>
//   3. docker run --rm with volume mount
//   4. Inside container: clone → install → build
//   5. Verify output directory exists on host (via volume)
//   6. Return outputPath to the caller
//   7. Caller is responsible for uploading/extracting output, then cleanup

app.post('/deploy', validateBody(deploySchema), async (c) => {
  const body = c.get('validatedBody') as DeployInput;

  const result = await runBuild({
    repoUrl: body.repoUrl,
    branch: body.branch,
    installCommand: body.installCommand,
    buildCommand: body.buildCommand,
    outputDir: body.outputDir,
    env: body.env,
  });

  if (!result.success) {
    return c.json(
      {
        buildId: result.buildId,
        error: result.error,
        logs: result.logs,
      },
      500,
    );
  }

  return c.json(
    {
      buildId: result.buildId,
      outputPath: result.outputPath,
      duration: result.duration,
      logs: result.logs,
    },
    201,
  );
});

export default app;
