# @deploystack/api-client

**Fully typed Hono RPC client** for the DeployStack API.

Uses `hc<AppType>` from Hono — no code generation, no schema files. The types flow directly from the server route definitions.

## Usage

```ts
import { createClient } from '@deploystack/api-client'

const client = createClient('https://api.deploystack.dev', token)
const { projects } = await client.api.projects.$get().then(r => r.json())
```

Used by `services/dashboard` and `services/cli`.