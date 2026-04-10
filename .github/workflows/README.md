# .github/workflows/

GitHub Actions CI/CD pipelines.

| File | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Every push + PR | Typecheck and test all packages |
| `deploy-api.yml` | Push to `main` (services/api changes) | Build Docker image → push to ECR → deploy |
| `deploy-router.yml` | Push to `main` (services/router changes) | `wrangler deploy` to Cloudflare Workers |
| `deploy-dashboard.yml` | Push to `main` (services/dashboard changes) | Build Docker image → deploy on DeployStack itself |