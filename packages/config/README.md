# @deploystack/config

**Zod-validated environment variable schemas** — crashes loudly on startup if a required variable is missing or malformed.

Each service calls `validateConfig()` at boot time before doing anything else.

## Usage

```ts
import { validateConfig } from '@deploystack/config'

const config = validateConfig() // throws if any required env var is missing
console.log(config.DATABASE_URL)
```
