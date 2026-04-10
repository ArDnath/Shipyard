# @deploystack/dashboard

**Web UI** for DeployStack — built with [Next.js 15](https://nextjs.org) (App Router).

This app is deployed on DeployStack itself — the ultimate dogfood moment.

## Structure

```
app/
├── (auth)/login/                         # Login page
├── projects/                             # Project list
├── projects/[id]/                        # Project detail
└── projects/[id]/deployments/[dId]/      # Deployment detail + live logs

components/
├── LogStream.tsx        # SSE live build log viewer
├── DeployButton.tsx     # One-click deploy trigger
├── DomainManager.tsx    # Add / verify custom domains
└── DeploymentStatus.tsx # Status badge + progress indicator
```

## Dev

```bash
bun run dev   # starts Next.js on :3001
```
