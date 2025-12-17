# StoryForge

A gamified writing platform that helps writers build consistent habits, craft worlds, and share short stories with privacy controls and social features. StoryForge blends elements of Campfire (world‑building), genealogy/graph apps (character relationships), Duolingo (streaks, goals, rewards), and Discord/social networks (groups, DMs, feeds) with a strong emphasis on mental wellbeing.

## Contents

- Objective & core value
- Architecture & repository structure
- Technical stack (choices, pros/cons, rationale, alternatives)
- Key features & product surfaces
- Security & privacy model (scopes)
- Prerequisites
- Environment variables and secrets (what, where to get, and how to set)
- Setup: install, migrate, seed, run (dev)
- Testing (current state and plan)
- Deployment guides (Vercel + Railway/Supabase/Neon)
- Troubleshooting
- Contributing & coding standards
- References

---

## Objective & Core Value

Help writers show up regularly and enjoy the process by:
- Reducing friction to write (fast editor, autosave, versioning later)
- Visual tools for world‑building (characters, relationships, timelines, maps)
- Gentle gamification (goals, streaks, gems) with mental‑health guardrails
- Social discovery and collaboration (public feed, friends/groups/DMs)
- Strong privacy controls per project and per item

See detailed product/architecture spec: `docs/story-forge-documentation.md`.

---

## Architecture & Repository Structure

Monorepo with separate web (Next.js) and api (NestJS) apps sharing a single Prisma schema and Postgres database.

```
story-forge/
├─ api/                    # NestJS backend (REST, health, future modules)
├─ web/                    # Next.js (App Router) frontend
├─ prisma/
│  └─ schema.prisma        # Shared database schema (PostgreSQL + Prisma)
├─ docs/
│  └─ story-forge-documentation.md  # In‑depth system/product spec
├─ .gitignore
└─ README.md
```

Request flow (MVP):
- Public users browse marketing pages and the public stories feed directly from Next.js (SSR/ISR capable).
- Authenticated users sign in via NextAuth (Credentials for now, OAuth later) stored in Postgres via Prisma.
- The backend (NestJS) exposes health endpoints and will gradually host API modules (users, projects, social, gamification). The web app can also read directly via Prisma where SSR is simpler; over time, move cross‑cutting logic to the API.

Public vs Authenticated Areas:
- Public: Home, Tutorial, Pricing, Public Stories Feed.
- Authenticated: Dashboard, Projects, Writing tools, Social.

---

## Technical Stack

Primary choices
- Frontend: Next.js 14 (App Router) + React 18 + TypeScript
- Auth: NextAuth v5 (Credentials now; OAuth later) with Prisma Adapter
- ORM/DB: Prisma + PostgreSQL
- Backend: NestJS 10 (TypeScript) with modular DI
- Styling (soon): Tailwind CSS + tokens from `docs/design-tokens.json`
- State: TanStack Query for server state; local state via React/Context (Zustand later)

Why these choices (pros/cons)
- Next.js
  - Pros: SSR/SSG/ISR for the public feed, great DX, edge‑ready, file‑based routing (App Router), React Server Components.
  - Cons: Some learning curve around RSC/app router patterns.
- NextAuth + Prisma Adapter
  - Pros: Mature auth flows; adapters for Postgres via Prisma; easy provider expansion (Google/GitHub, etc.).
  - Cons: Provider configuration & v5 typings can be nuanced.
- Prisma + PostgreSQL
  - Pros: Type‑safe DB access, great migration workflow, excellent TS DX, Postgres reliability.
  - Cons: ORM abstractions can hide SQL details; schema drift must be managed.
- NestJS
  - Pros: Opinionated modular server with DI, testing patterns, guards/filters; scales from MVP to services.
  - Cons: More boilerplate vs. minimal Express/Fastify.

Alternatives (and when to consider)
- Remix/SvelteKit for the web if team prefers fully server‑driven UX or smaller bundles.
- Drizzle ORM if you prefer SQL‑first migrations.
- Supabase as a BaaS (Auth, DB, Realtime, Storage) to simplify infra for very small teams.

Color & Design System
- Palette: auburn, royal blue/green/orange, gold, burgundy, purple, pink, black/white.
- Tokens defined in `docs/design-tokens.json` and will be mapped to Tailwind CSS variables.

---

## Key Features (MVP trajectory)

- Guest browsing: public marketing + public stories feed.
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

- Node.js 18+ (LTS recommended). Check with `node -v`.
- npm 9+ (or pnpm/yarn if you prefer; docs use npm).
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

## Testing

Current status
- Unit/E2E test scaffolding has not been added yet. This will land alongside the first protected routes and project CRUD.

Planned stack
- Web: Jest + React Testing Library for components; Playwright or Cypress for E2E.
- API: Jest + Supertest for module/route tests.

Short‑term goals
- Add smoke tests for auth (sign in redirect, invalid creds error) and a healthcheck test for the API.

How to run (once added)
```
cd web && npm test
cd ../api && npm test
```

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
