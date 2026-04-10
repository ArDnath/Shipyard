# @deploystack/api

**Control-plane API** built with [Hono](https://hono.dev) on [Bun](https://bun.sh).

Handles authentication, project management, deployment triggering, custom domains, environment variables, and GitHub webhooks.

## Structure

```
src/
├── index.ts          # Hono app entry point
├── types.ts          # Exported AppType for RPC client
├── routes/
│   ├── projects.ts   # CRUD for projects
│   ├── deployments.ts# Trigger & track deployments
│   ├── domains.ts    # Custom domain management
│   ├── webhooks.ts   # GitHub push event handler
│   └── envvars.ts    # Environment variable management
├── middleware/
│   ├── auth.ts       # JWT verification middleware
│   └── rateLimit.ts  # Per-user rate limiting
├── db/
│   ├── schema.ts     # Drizzle table definitions
│   ├── client.ts     # Database connection
│   └── migrations/   # SQL migration files
└── queue/
    └── producer.ts   # Publish build jobs to Redis
```

## Dev

```bash
bun run dev   # hot-reload on :3000