# packages/

Shared internal TypeScript packages consumed across all services.

| Package | Description |
|---|---|
| `types/` | Single source of truth for all shared TypeScript types |
| `api-client/` | Hono RPC typed client (`hc<AppType>`) — used by dashboard + CLI |
| `db/` | Drizzle ORM schema, client, and migrations |
| `queue/` | Redis job producer/consumer helpers with typed payloads |
| `config/` | Zod-validated environment variable schemas — crash early on missing config |
| `tsconfig/` | Shared `tsconfig.json` presets for each environment |

All packages are referenced as `workspace:*` in dependent `package.json` files.