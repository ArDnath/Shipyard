# middleware/

Hono middleware for the API service.

| File | Purpose |
|---|---|
| `auth.ts` | Verifies JWT Bearer token, sets `c.var.user` |
| `rateLimit.ts` | Sliding-window rate limiting per authenticated user |