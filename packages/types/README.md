# @deploystack/types

**Single source of truth** for all shared TypeScript types across the DeployStack monorepo.

Every service and package imports from here — zero type drift between services.

## Exports

| File | Types |
|---|---|
| `src/deployment.ts` | `Deployment`, `DeploymentStatus`, `CreateDeploymentInput` |
| `src/project.ts` | `Project`, `Framework`, `CreateProjectInput` |
| `src/domain.ts` | `Domain`, `DomainStatus`, `CreateDomainInput` |
| `src/queue.ts` | `BuildJobPayload`, `Job`, `JobType` |
| `src/routes.ts` | `RoutesManifest`, `RouteRule` (the `routes.json` shape) |

## Usage

```ts
import type { Deployment, BuildJobPayload } from '@deploystack/types'
```
