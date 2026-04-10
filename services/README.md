# services/

All runnable applications in the DeployStack platform.

| Service | Tech | Description |
|---|---|---|
| `api/` | Hono + Bun | Control-plane REST/RPC API — auth, projects, deployments, domains |
| `builder/` | Bun worker | Queue consumer — detect framework, build in sandbox, upload to S3 |
| `router/` | Hono + CF Workers | Edge proxy — routes traffic to the correct deployment |
| `dashboard/` | Next.js 15 | Web UI for managing projects and deployments |
| `cli/` | Bun binary | `deploystack deploy`, `logs`, `env set` and more |