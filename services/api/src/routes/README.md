# routes/

Hono route handlers for the DeployStack API.

| File | Endpoints |
|---|---|
| `projects.ts` | `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/:id` |
| `deployments.ts` | `GET/POST /api/deployments`, `GET /api/deployments/:id`, SSE logs |
| `domains.ts` | `GET/POST /api/domains`, `DELETE/GET /api/domains/:id` |
| `webhooks.ts` | `POST /webhooks/github` |
| `envvars.ts` | `GET/PUT /api/envvars`, `DELETE /api/envvars/:id` |