# Deployment Guide

This guide assumes a typical split architecture:

- **Backend API** (containerized service)
- **PostgreSQL** database
- **Frontend** (static SPA or server-rendered app)

It uses **Render + Neon + Cloudflare Pages** as a concrete example because they are common and easy to set up, but the same patterns work on AWS/GCP/Azure/Fly.io/Railway.

---

## 1) Architecture options

## Option A (recommended for most teams)
- Backend: Managed container/web service platform (Render, Fly.io, Railway, ECS/Fargate, Cloud Run)
- Database: Managed PostgreSQL (Neon, RDS, Cloud SQL, Supabase)
- Frontend: Static host/CDN (Cloudflare Pages, Vercel, Netlify, S3+CloudFront)

**Pros:** low ops overhead, autoscaling, CDN, easier rollbacks.

## Option B (single VM)
- Backend + Frontend + PostgreSQL on one Linux server with Docker Compose.

**Pros:** simple mental model.

**Cons:** higher maintenance, weaker fault isolation, harder scaling.

---

## 2) Backend + PostgreSQL hosting (example: Render + Neon)

## Prerequisites
- GitHub repo connected to your cloud platform
- Dockerfile for backend (or native runtime build command)
- Database migration command (e.g., `npm run migrate`, `alembic upgrade head`, `prisma migrate deploy`)

## Step-by-step
1. **Create PostgreSQL instance** in Neon (or equivalent managed provider).
2. Copy connection string, usually in the form:
   `postgres://USER:PASSWORD@HOST:5432/DB?sslmode=require`
3. In Render, create a **Web Service** for backend.
4. Configure:
   - Build command (or Docker build)
   - Start command (run API server)
   - Health check path (e.g. `/health`)
5. Add environment variables (see section 4).
6. Ensure startup sequence includes migrations before serving traffic:
   - Option 1: release phase / pre-deploy command
   - Option 2: entrypoint script that runs migrations then starts app
7. Restrict DB access:
   - strong credentials
   - SSL required
   - IP allowlist/VPC if provider supports it
8. Verify:
   - backend deploy logs show successful boot
   - migrations applied
   - `/health` returns 200

## Production hardening checklist
- Set CPU/memory limits
- Enable autoscaling (if available)
- Enable log retention + alerting
- Add backup/point-in-time recovery for database
- Set connection pooling (PgBouncer/provider pooler)

---

## 3) Frontend hosting options

## A) Static hosting (recommended for SPA/static export)
Use Cloudflare Pages / Vercel / Netlify.

1. Connect repo.
2. Set build command (e.g., `npm ci && npm run build`).
3. Set output directory (`dist`, `build`, or `.next/out`).
4. Configure frontend env vars (public API base URL).
5. Add SPA rewrite rule to `index.html` for client-side routes.
6. Configure custom domain + HTTPS.

## B) Same server as backend
If you must colocate:

- Build frontend during CI.
- Serve built assets via Nginx or backend static middleware.
- Route:
  - `/api/*` -> backend app
  - `/*` -> frontend index/static assets

This reduces platform count but couples deploy cadence.

---

## 4) Environment variable setup

Use `.env.example` in repo and never commit real secrets.

## Typical backend variables
- `NODE_ENV=production` (or framework equivalent)
- `PORT=8080`
- `DATABASE_URL=postgres://...`
- `JWT_SECRET=...` (or session secret)
- `CORS_ORIGIN=https://your-frontend-domain`
- `LOG_LEVEL=info`
- `SENTRY_DSN=...` (optional)
- `REDIS_URL=...` (optional)

## Typical frontend variables
- `VITE_API_BASE_URL=https://api.yourdomain.com`
- `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com`

(Use whichever prefix your framework requires.)

## Secret management best practices
- Store secrets only in platform secret manager / CI secrets.
- Rotate secrets on schedule.
- Use separate values per environment (`dev`, `staging`, `prod`).
- Do not expose server-only secrets to frontend bundles.

---

## 5) Basic CI/CD pipeline (GitHub Actions example)

Create `.github/workflows/deploy.yml` with:

- Trigger on push to `main` and PRs.
- Jobs:
  1. `test` (lint + unit tests)
  2. `build` (backend image / frontend artifact)
  3. `deploy_staging` (optional, on main)
  4. `deploy_production` (manual approval or tagged release)

## Minimal workflow outline

```yaml
name: CI-CD
on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --ci

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:${{ github.sha }} .

  deploy_production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger platform deploy
        run: |
          curl -X POST "$RENDER_DEPLOY_HOOK_URL"
        env:
          RENDER_DEPLOY_HOOK_URL: ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

## CI/CD best practices
- Run DB migrations as release step, not ad-hoc.
- Use health checks and fail deployment if unhealthy.
- Keep staging and production separate.
- Add rollback path (previous image/version).
- Protect `main` with required checks.

---

## 6) Suggested rollout plan

1. Provision managed PostgreSQL.
2. Deploy backend to staging, connect DB, run migrations.
3. Deploy frontend to staging, point to staging API.
4. Validate end-to-end + smoke tests.
5. Configure production env vars/secrets.
6. Deploy production backend then frontend.
7. Monitor logs, error rate, latency for first 24 hours.

---

## 7) Quick verification checklist

- [ ] API health endpoint returns 200 in production.
- [ ] Frontend can call production API over HTTPS.
- [ ] CORS configured only for allowed domains.
- [ ] Database backups enabled and tested.
- [ ] CI checks must pass before merge.
- [ ] Deployment can be rolled back in under 15 minutes.
