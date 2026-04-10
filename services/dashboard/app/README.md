# app/

Next.js 15 App Router pages.

| Route | Description |
|---|---|
| `(auth)/login/page.tsx` | GitHub OAuth login page |
| `projects/page.tsx` | List all projects for the authenticated user |
| `projects/[id]/page.tsx` | Project detail — settings, deployments list |
| `projects/[id]/deployments/[dId]/page.tsx` | Deployment detail — status, live logs, URL |