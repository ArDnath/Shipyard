# db/

Database layer for the API service using [Drizzle ORM](https://orm.drizzle.team).

| File | Purpose |
|---|---|
| `schema.ts` | Table definitions: users, projects, deployments, domains, env_vars |
| `client.ts` | Drizzle + postgres.js connection pool |
| `migrations/` | Auto-generated SQL migration files |