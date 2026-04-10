# @deploystack/router

**Edge proxy** built with [Hono](https://hono.dev) deployed to [Cloudflare Workers](https://workers.cloudflare.com).

Resolves incoming hostnames to the correct deployment, applies rewrite/redirect rules, serves static assets from R2/S3, and invokes serverless functions — all at the edge with zero cold starts.

## Structure

```
src/
├── index.ts      # Hono app — main request handler
├── resolver.ts   # Maps hostname → active deployment
├── rules.ts      # Evaluates rewrite and redirect rules
├── static.ts     # Proxies static assets from R2/S3
├── fn-runner.ts  # Invokes serverless functions
└── ssl.ts        # TLS handled by Cloudflare (cert provisioning)
```

## Deploy

```bash
wrangler deploy
```

Configure in `wrangler.toml`.