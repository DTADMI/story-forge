- Accounts: email/password (Credentials) with migration path to OAuth.
- Projects: create/list with visibility controls (`private`, `friends`, `public-auth`, `public-anyone`).
- Writing tools: TipTap‑based editor and world‑building entities (rolling out incrementally).
- Social: follow/friends, comments, groups (phased).
- Gamification: goals, streaks, gem wallet prototype; mental health guardrails.

Access Scopes & Privacy Model
- Default scope per project + per‑item overrides; public feed only surfaces eligible content.

Security Posture (early hardening)
- Session JWTs, rate limiting on auth, input validation, CORS, secrets management, audit trails later.

---

## Prerequisites

- Node.js 24+ (recommend 24.12.0). Check with `node -v`.
- pnpm 10+ (recommend 10.26.0; or npm/yarn if you prefer; examples assume pnpm).
- PostgreSQL 14+ (local install or hosted: Supabase/Neon/Railway).
- Git.
- Optional: Docker (to run Postgres locally via Compose).

Recommended accounts for deployment
- Vercel (web), Railway (API), and Supabase/Neon (Postgres). Free tiers are sufficient for MVP.

---

## Environment Variables & Secrets

Templates
- Root: `.env.example` (copy to `.env`)
- Web: `web/.env.example` (copy to `web/.env.local`)
- API: `api/.env.example` (copy to `api/.env`)

Minimum required for local dev
- DATABASE_URL: Postgres connection string. Example (local):
  - `postgresql://postgres:postgres@localhost:5432/storyforge?schema=public`
  - Where to get: create a local DB or a hosted instance (Supabase/Neon) and copy the connection URL.
- NEXTAUTH_SECRET (web): a strong random string (e.g., `openssl rand -base64 32`)
- NEXTAUTH_URL (web): `http://localhost:3000` during local dev
- API PORT (api): optional; defaults to 3001
- ALLOWED_ORIGINS (api): comma‑separated origins allowed by CORS, e.g. `http://localhost:3000`

Optional (future features)
- OAuth providers (web): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, `GITHUB_SECRET` (from provider consoles)
- Email (web/api): `RESEND_API_KEY` or AWS SES creds for transactional mail
- SMS (api): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`

Notes
- Keep secrets out of source control. Use `.env.local` for Next.js and a secrets manager in CI/CD.

---

## Setup & Local Development

1) Clone the repo
```
git clone https://github.com/<your-org>/story-forge.git
cd story-forge
```

2) Create databases (local Postgres)
- Ensure Postgres is running and create a database named `storyforge` (or use Supabase/Neon/Railway and copy the URL).

3) Copy env files and fill values
```
cp .env.example .env
cp web/.env.example web/.env.local
cp api/.env.example api/.env
```
Set at minimum:
- In `.env`: `DATABASE_URL=postgresql://...`
- In `web/.env.local`: `NEXTAUTH_SECRET=...`, `NEXTAUTH_URL=http://localhost:3000`, and `DATABASE_URL=postgresql://...` (same as root)
- In `api/.env`: `ALLOWED_ORIGINS=http://localhost:3000` and optionally `PORT=3001`

4) Install dependencies
```
cd web && npm install
cd ../api && npm install
cd ..
```

5) Generate Prisma client and run migrations

Because the Prisma schema lives in the repo root (`/prisma/schema.prisma`) while the web and api apps depend on `@prisma/client`, run generate from each app and point to the shared schema file:

```
# From web/
cd web
npx prisma generate --schema=../prisma/schema.prisma

# From api/
cd ../api
npx prisma generate --schema=../prisma/schema.prisma

# Run migrations once (from repo root or either app)
cd ..
npx prisma migrate dev --schema=./prisma/schema.prisma
```

Tip: web has convenience scripts, but they assume a default schema location. Prefer the explicit `--schema` flag above.

6) Seed demo data (user + sample project)
```
cd web
npm run seed
```
This creates a demo account: `demo@storyforge.app` with password `password123` and one public project.

7) Start the apps
```
# Web (Next.js on http://localhost:3000)
cd web
npm run dev

# API (NestJS on http://localhost:3001)
cd ../api
npm run start:dev
```

8) Try it out
- Visit `http://localhost:3000/signin` and log in with the demo account.
- Browse the marketing pages and the public feed (soon at `/feed`).

---

## Authentication (NextAuth v4)

We use NextAuth v4.24.13 with the Prisma Adapter and a Credentials provider (email/password) for MVP.

Implementation

- Shared options: `web/src/lib/auth.ts` exports `authOptions` (Prisma Adapter, Credentials, JWT sessions, callbacks).
- API route: `web/src/app/api/auth/[...nextauth]/route.ts` creates a handler with `NextAuth(authOptions)` and exports it
  as `GET`/`POST`.
- Prisma models: `User`, `Account`, `Session`, `VerificationToken` are defined in `prisma/schema.prisma`.

Environment

- `web/.env.local` must include: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `DATABASE_URL`.

Usage

- Get the current session in a Server Component/Action:
  ```ts
  // any server file in web/
  import { getServerSession } from 'next-auth';
  import { authOptions } from '@/lib/auth';
  const session = await getServerSession(authOptions);
  ```
- Trigger sign-in from a client component:
  ```ts
  'use client'
  import { signIn } from 'next-auth/react';
  await signIn('credentials', { email, password, redirect: true, callbackUrl: '/' });
  ```

- Sign-up (create account) via API route:
  - Endpoint: `POST /api/auth/signup`
  - Body: `{ email: string, password: string (min 8), name?: string }`
  - Validation: Zod on server; errors return 400/409
  - On success (201), the client may auto sign-in via credentials
  - Example client page at `/signup`

- Protected routes (App Router):
  - We protect authenticated areas with a server layout at `app/(main)/layout.tsx` using `getServerSession(authOptions)`
    and `redirect('/signin')` when unauthenticated.
  - Example protected page: `app/(main)/dashboard/page.tsx` which also shows a Sign out button.

- Sign out (client):
  ```ts
  'use client'
  import { signOut } from 'next-auth/react';
  signOut({ callbackUrl: '/signin' });
  ```

Notes

- Sessions use JWT strategy and we augment `session.user.id` via callbacks for convenience.
- The sign-in page lives at `/signin` and posts to the Credentials provider.
- The sign-up page lives at `/signup` and posts to the API route, then auto-signs-in the user.
- We intentionally stay on pnpm and NextAuth v4 for stability until v5 reaches a stable release.

---

## Testing

Current status

- Web: Vitest + React Testing Library are configured with jsdom. Smoke tests cover the Home page, Button component, and
  Public Feed page.
- API: test harness not set up yet (planned: Jest + Supertest).

How to run (web)
```
cd web
pnpm test           # watch mode
pnpm test:run       # CI mode
```

Stack

- Web: Vitest + React Testing Library (+ jest-dom)
- API (planned): Jest + Supertest

---

## Continuous Integration (CI)

We use GitHub Actions for CI. An initial workflow runs web tests and build on Node 24.12 with pnpm 10.26.

Workflow: `.github/workflows/ci.yml`

- Steps: checkout → setup Node (corepack pnpm) → `pnpm -w install` → `pnpm -C web test:run` → `pnpm -C web build`
- Next enhancements (planned): add API build and `prisma generate` on the shared schema.

---

## Feature Flags

Feature flags allow enabling/disabling areas incrementally across web and API.

Web (client-visible):

- Defined via `NEXT_PUBLIC_FEATURE_*` env vars (see `web/.env.example`).
- Consumed through `web/src/lib/flags.ts` which exports `flags` and `isEnabled(key)`.

API (server-only):

- Defined via `API_FEATURE_*` env vars (see `api/.env.example`).
- Read in `api/src/config/flags.ts` exporting `apiFlags` and `isApiFlagEnabled(key)`.

Shared keys: `payments`, `aiAssist`, `projectsV2`, `wellbeing`, `designSystemV2`.

---

## Deployment

MVP recommendation: Vercel (web) + Railway (API) + Supabase/Neon (Postgres)

Environment preparation
- Create a production Postgres (Supabase/Neon). Copy the `DATABASE_URL`.
- Generate unique `NEXTAUTH_SECRET`.
- Decide canonical URLs: `WEB_URL` and `API_URL`.

Web (Vercel)
1. Import the `web/` app in Vercel and set:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` = your production web URL (e.g., `https://app.storyforge.app`)
   - `DATABASE_URL` = your production Postgres URL
2. Build & deploy. Configure a custom domain if desired.

API (Railway)
1. Create a new service from the `api/` folder.
2. Set env vars:
   - `DATABASE_URL`
   - `ALLOWED_ORIGINS` = your web app URL(s)
   - `PORT` = `3001` (or leave default)
3. Deploy. Ensure the service is reachable and health endpoints respond.

Database migrations in production
```
# Option A (one‑off): run from a CI job or a local machine with prod DATABASE_URL
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Option B: add a deploy step in CI that runs the above
```

Alternative single‑cloud deployment
- Fly.io can host the web, API, and Postgres together with low‑latency multi‑region scale.

---

## Troubleshooting

- Prisma generate errors from web/api
  - Ensure you pass `--schema=../prisma/schema.prisma` when running from `web/` or `api/`.
  - Verify `@prisma/client` is installed in the app you’re running generate from.

- NextAuth errors about missing secret or URL
  - Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in `web/.env.local` (and in Vercel for prod).

- Cannot connect to Postgres
  - Check `DATABASE_URL`, DB is running, credentials correct, and firewall/SSL settings for hosted DBs.

- CORS failures when calling API from Web
  - Ensure `ALLOWED_ORIGINS` includes `http://localhost:3000` (dev) or your production web origin(s).

---

## Contributing & Coding Standards

- Language: TypeScript across the stack.
- Style: ESLint + Prettier (config will be added). Align with existing patterns and file layout.
- Commits: conventional, small, and descriptive; include scope when possible.
- Security: never commit secrets; prefer `.env.local` and CI secrets.
- Branching: feature branches with PRs; enable preview deploys when possible.

---

## References

- Full product/architecture spec: `docs/story-forge-documentation.md`
- Design tokens & palette: `docs/design-tokens.json`
- Prisma schema: `prisma/schema.prisma`
- NextAuth route handler: `web/src/app/api/auth/[...nextauth]/route.ts`
- Sign‑in page (Credentials): `web/src/app/(auth)/signin/page.tsx`
- Nest API bootstrap: `api/src/main.ts` and `api/src/app.module.ts`

If anything in this README is unclear or you encounter setup issues, please open an issue with details about your OS, Node.js version, and logs.

### Public routes (unauthenticated)

- `/` — Marketing home and overview
- `/pricing` — Pricing & subscriptions explainer
- `/feed` — Public stories feed (SSR placeholder, scoped to `public-anyone`)
- `/components-demo` — Internal demo page for UI primitives (temporary)

### Styling & Design Tokens

- Tailwind CSS 4.1 configless setup with `@tailwind base; @tailwind components; @tailwind utilities;` in
  `web/src/styles/globals.css`.
- Design tokens are exposed as CSS variables (e.g., `--bg`, `--fg`, `--brand`) and mapped to utility-like classes (
  `bg-bg`, `text-fg`, etc.) for ergonomic usage without a Tailwind config.
- Dark mode uses the `.dark` class toggling token values.
