# @deploystack/tsconfig

Shared TypeScript configuration presets for all services and packages.

| File | Used By |
|---|---|
| `base.json` | All packages — strict mode, bundler resolution |
| `bun.json` | Bun-based services (`api`, `builder`, `cli`) |
| `nextjs.json` | `services/dashboard` |
| `cloudflare.json` | `services/router` (Cloudflare Workers) |

## Usage

In each `tsconfig.json`:
```json
{
  "extends": "@deploystack/tsconfig/bun.json"
}
```
