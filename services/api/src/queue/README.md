# queue/

Redis queue integration for the API service.

| File | Purpose |
|---|---|
| `producer.ts` | Publishes build jobs onto the `deploystack:builds` Redis list |

The builder service consumes from the same list using `BRPOP`.