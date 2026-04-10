# @deploystack/builder

**Build worker** — a Bun queue consumer that processes deployment jobs.

Consumes jobs from Redis, clones the repo, detects the framework, runs the build inside a Docker sandbox, uploads artifacts to S3/R2, and streams logs back to the API in real time.

## Structure

```
src/
├── index.ts          # Worker entrypoint
├── worker.ts         # BRPOP loop + job dispatcher
├── detect.ts         # Framework detection (Next.js, Vite, Astro…)
├── sandbox.ts        # Docker-based build isolation
├── logstream.ts      # SSE log push back to API via Redis pub/sub
├── cache.ts          # S3 layer caching for node_modules
└── steps/
    ├── install.ts    # Run install command in sandbox
    ├── build.ts      # Run build command in sandbox
    ├── upload.ts     # Upload dist/ to S3/R2
    └── routes.ts     # Generate routes.json manifest
```

## Dev

```bash
bun run dev   # starts worker, polls Redis queue
```
