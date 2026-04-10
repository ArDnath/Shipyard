# @deploystack/cli

**Command-line interface** for DeployStack — compiled to a single binary with `bun build --compile`.

No Node.js required on the user's machine.

## Commands

| Command | Description |
|---|---|
| `deploystack login` | Authenticate via browser OAuth |
| `deploystack deploy` | Deploy the current directory |
| `deploystack dev` | Run the project locally via the API |
| `deploystack logs` | Stream live logs for a deployment |
| `deploystack env set KEY=VALUE` | Set an environment variable |

## Structure

```
src/
├── index.ts           # Commander.js CLI entry point
├── api.ts             # Typed API client (hc<AppType>)
├── auth.ts            # Token storage in ~/.deploystack
├── link.ts            # Read/write deploystack.json project link
└── commands/
    ├── deploy.ts
    ├── dev.ts
    ├── logs.ts
    ├── env.ts
    └── login.ts
```

## Build Binary

```bash
bun build --compile src/index.ts --outfile deploystack
```
