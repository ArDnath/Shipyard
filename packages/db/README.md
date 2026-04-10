# @deploystack/db

**Shared database layer** — Drizzle ORM schema, client, and migrations.

Both `services/api` and `services/builder` import from this package to avoid duplicating schema definitions.

## Structure

```
src/
├── schema.ts     # Table definitions (users, projects, deployments, domains, env_vars)
└── client.ts     # postgres.js + Drizzle connection
migrations/       # Auto-generated SQL files (drizzle-kit)
drizzle.config.ts # Drizzle Kit configuration
```

## Commands

```bash
# Run migrations against DATABASE_URL
bun run migrate

# Generate a new migration after schema changes
bunx drizzle-kit generate
```
