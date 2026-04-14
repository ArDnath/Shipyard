import { Hono } from 'hono';
import { validateBody } from './middleware/validate';
import { cloneRepo } from './utils/git';
import { deploySchema } from './utils/validate';
import type { DeployInput } from './utils/validate';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Shipyard Api running');
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

export default app;
