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
