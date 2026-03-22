
**[2026-03-23]** — action — Received brief from CIO: draft Vercel + Railway deployment plan. Reviewing the architecture: Next.js app with filesystem-based API. Core constraint: Vercel is stateless/ephemeral, Railway supports persistent filesystem. Plan: frontend + UI routes on Vercel, agent API routes on Railway Node.js service.

---

**[2026-03-23]** — decision — Deployment architecture plan: (1) Vercel: hosts the Next.js app (pages, UI, static assets). All non-filesystem API routes can stay here. (2) Railway: hosts a standalone Node.js/Express service with the agents directory mounted. Exposes /api/org-tree, /api/activity-feed, /api/agent-data endpoints. (3) Vercel proxies API calls to Railway via NEXT_PUBLIC_API_URL env var. (4) CI/CD: GitHub Actions on push to main — runs `npm run build`, runs Playwright e2e tests, deploys to Vercel if green. (5) Staging: separate Vercel preview deployments on PRs. Draft plan sent to CIO today.

---
