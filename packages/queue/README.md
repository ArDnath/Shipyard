# @deploystack/queue

**Redis job queue helpers** — shared producer and consumer utilities with fully typed job payloads.

Used by `services/api` (producer) and `services/builder` (consumer).

## Structure

```
src/
├── client.ts   # Redis connection factory
└── jobs.ts     # Job type registry and typed payload definitions
```

## Usage

```ts
import { createQueue, JobType } from '@deploystack/queue'

const queue = createQueue(redisUrl)
await queue.publish(JobType.Build, payload)
```
