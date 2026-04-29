# How to Run Automated E2E Testing in Preview Environments

Companion code for the Autonoma blog post 'How to Run Automated E2E Testing in Preview Environments'. Working Playwright + GitHub Actions setup for running E2E tests against per-PR preview environments.

> Companion code for the Autonoma blog post: **[How to Run Automated E2E Testing in Preview Environments](https://getautonoma.com/blog/automated-qa-inside-every-preview-environment)**

## Requirements

Node 20+, a per-PR preview deployment platform (Vercel, Netlify, Render, Railway, fly.io, etc.), and a server-side bypass-token handler in your app's auth middleware that is only honored on preview deployments.

## Quickstart

```bash
git clone https://github.com/Autonoma-Tools/automated-qa-inside-every-preview-environment.git
cd automated-qa-inside-every-preview-environment
1. Install deps: npm install
2. Install Playwright browsers: npx playwright install --with-deps chromium
3. Copy env file: cp .env.example .env (then fill in your preview URL, bypass token, and seed API key)
4. Seed the preview DB: npm run seed:preview
5. Run tests against the preview: npm run test:e2e
```

## Project structure

```
.
├── .env.example
├── .github/
│   └── workflows/
│       └── e2e-on-preview.yml
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── playwright.config.ts
├── scripts/
│   └── seed-preview.ts
└── tsconfig.json
```

- `.github/workflows/` — GitHub Actions workflow that deploys the preview, waits for it to become healthy, seeds the DB, and runs Playwright with the dynamic preview URL injected.
- `playwright.config.ts` — Playwright config that reads `PLAYWRIGHT_BASE_URL` and attaches the `x-preview-bypass-token` header so test traffic bypasses preview access control.
- `scripts/seed-preview.ts` — TypeScript seed script that creates a test user, organization, and feature flag against the preview environment's seed API.

## About

This repository is maintained by [Autonoma](https://getautonoma.com) as reference material for the linked blog post. Autonoma builds autonomous AI agents that plan, execute, and maintain end-to-end tests directly from your codebase.

If something here is wrong, out of date, or unclear, please [open an issue](https://github.com/Autonoma-Tools/automated-qa-inside-every-preview-environment/issues/new).

## License

Released under the [MIT License](./LICENSE) © 2026 Autonoma Labs.
