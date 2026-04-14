import { Hono } from 'hono';
import { cloneRepo } from './utils/git';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Shipyard Api running');
});

app.post('/clone', async (c) => {
  const body = await c.req.json();
  const { repoUrl } = body;

  if (!repoUrl) {
    return c.json(
      {
        error: 'repoUrl is required',
      },
      400,
    );
  }

  const result = await cloneRepo(repoUrl);

  return c.json(result);
});

export default app;
