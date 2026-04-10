# DeployStack

A Vercel-like distributed deployment platform built with **Hono**, **Bun**, **Next.js 15**, and **Cloudflare Workers**.

## Monorepo Structure

```
deploystack/
├── services/         # All runnable applications
│   ├── api/          # Hono + Bun control-plane API
│   ├── builder/      # Bun queue worker — clone, build, upload
│   ├── router/       # Hono on Cloudflare Workers — edge proxy
│   ├── dashboard/    # Next.js 15 web UI
│   └── cli/          # Bun single-binary CLI tool
├── packages/         # Shared internal packages
│   ├── types/        # Shared TypeScript types
│   ├── api-client/   # Hono RPC typed client
│   ├── db/           # Drizzle ORM schema + migrations
│   ├── queue/        # Redis job queue helpers
│   ├── config/       # Zod env variable validation
│   └── tsconfig/     # Shared TypeScript configs
├── infra/            # Terraform — AWS S3, RDS, Redis, ECR
└── .github/          # GitHub Actions CI/CD workflows
```

## Quick Start

```bash
bun install
docker compose up -d
cp .env.example .env
make dev
```

## Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Bun |
| API Framework | Hono |
| Database | PostgreSQL + Drizzle ORM |
| Queue | Redis |
| Edge Router | Cloudflare Workers |
| Dashboard | Next.js 15 |
| CLI | Bun compiled binary |
| Infra | Terraform on AWS |