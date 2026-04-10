# commands/

Individual CLI command implementations using [Commander.js](https://github.com/tj/commander.js).

| File | Command | Description |
|---|---|---|
| `login.ts` | `deploystack login` | OAuth login flow, saves token to `~/.deploystack` |
| `deploy.ts` | `deploystack deploy` | Zip and push current dir, trigger deployment |
| `dev.ts` | `deploystack dev` | Local dev proxy via the platform |
| `logs.ts` | `deploystack logs` | Stream SSE logs for a deployment |
| `env.ts` | `deploystack env` | Get/set/delete environment variables |