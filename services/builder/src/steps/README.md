# steps/

Individual build pipeline steps executed in sequence by the worker.

| File | Purpose |
|---|---|
| `install.ts` | Runs `npm install` / `bun install` inside the sandbox |
| `build.ts` | Runs the project's build command (e.g. `next build`) |
| `upload.ts` | Uploads the output directory to S3 or Cloudflare R2 |
| `routes.ts` | Generates a `routes.json` manifest for the edge router |