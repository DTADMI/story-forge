# StoryForge

A gamified creative writing platform for novelists, screenwriters, comic creators, and visual storytellers. StoryForge
helps writers build consistent habits, craft immersive worlds, and share stories with granular privacy controls.

Whether you're writing novels, short stories, screenplays, comics, graphic novels, or webtoons, StoryForge provides
TipTap rich-text editing, comprehensive world-building tools (characters, locations, timelines, dialogue scenes), visual
asset management, Duolingo-style gamification (Ink currency, goals, streaks, milestone badges), and social features (
follow/followers, groups, public feed) with mental wellbeing safeguards and break reminders.

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

Help writers and visual storytellers show up regularly and enjoy the creative process by:

- **Reducing friction to create:** TipTap rich-text editor with autosave, word count tracking, project versioning, and
  visual asset organization
- **Comprehensive world-building tools:** Characters with visual references, locations, timeline events, dialogue/script
  scenes, and flexible metadata—perfect for novels, comics, graphic novels, screenplays, and webtoons
- **Visual storytelling support:** Character design galleries, location reference boards, scene scripting with
  dialogue/panel breakdowns, and image metadata for sequential art
- **Gentle gamification:** Ink currency system, daily/weekly goals (words or panels), streak tracking, milestone badges,
  and break reminders for mental wellbeing
- **Social discovery & collaboration:** Follow/followers system, public story/comic feed, groups, and granular
  per-project visibility controls
- **Strong privacy model:** Four-tier visibility scopes (Private, Friends, Public-Auth, Public-Anyone) at project and
  entity levels

See detailed product/architecture spec: `docs/story-forge-documentation.md`.

---

## Architecture & Repository Structure

Monorepo with separate web (Next.js) and api (NestJS) apps sharing a single Prisma schema and Postgres database.

```
story-forge/
├─ api/                    # NestJS backend
│  ├─ src/
│  │  ├─ modules/
│  │  │  ├─ auth/          # API authentication (JWT verification)
│  │  │  ├─ billing/       # Stripe integration (behind feature flag)
│  │  │  ├─ debug/         # Debug endpoints (dev only)
│  │  │  ├─ gamification/  # Ink, goals, badges, progress
│  │  │  ├─ health/        # Health check endpoints
│  │  │  ├─ projects/      # Project CRUD operations
│  │  │  ├─ social/        # Follow/followers, groups
│  │  │  ├─ users/         # User management
│  │  │  └─ world/         # Characters, locations, timelines, dialogue
│  │  ├─ common/           # Shared guards, decorators, filters
│  │  ├─ config/           # Environment validation (Zod)
│  │  ├─ app.module.ts
│  │  └─ main.ts
│  ├─ .env.example
│  └─ package.json
├─ web/                    # Next.js (App Router) frontend
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ (auth)/        # Sign in, sign up
│  │  │  ├─ (main)/        # Authenticated routes
│  │  │  │  ├─ dashboard/
│  │  │  │  ├─ profile/
│  │  │  │  ├─ projects/   # Project list, editor
│  │  │  │  ├─ social/     # Followers, following
│  │  │  │  ├─ users/      # User discovery
│  │  │  │  └─ world/      # World-building tools
│  │  │  ├─ (marketing)/   # Public pages
│  │  │  │  ├─ feed/       # Public stories feed
│  │  │  │  ├─ pricing/
│  │  │  │  └─ tutorial/
│  │  │  ├─ api/           # Next.js API routes
│  │  │  │  ├─ auth/       # NextAuth handlers
│  │  │  │  ├─ billing/    # Stripe proxy
│  │  │  │  ├─ checkout/
│  │  │  │  ├─ projects/
│  │  │  │  ├─ public/
│  │  │  │  └─ social/
│  │  │  ├─ about/
│  │  │  ├─ billing/
│  │  │  ├─ components-demo/
│  │  │  ├─ faq/
│  │  │  ├─ feed/
│  │  │  ├─ pricing/
│  │  │  └─ page.tsx       # Landing page
│  │  ├─ components/       # React components
│  │  ├─ lib/              # Utilities, API client, env validation
│  │  └─ styles/
│  ├─ .env.example
│  └─ package.json
├─ prisma/
│  ├─ schema.prisma        # Shared database schema (PostgreSQL + Prisma)
│  └─ migrations/          # Database migrations
├─ docs/
│  ├─ story-forge-documentation.md  # In‑depth system/product spec
│  └─ design-tokens.json   # Color palette and design system
├─ .env.example
├─ .gitignore
├─ package.json
└─ README.md
```

Request flow (MVP):

- Public users browse marketing pages and the public stories feed directly from Next.js (SSR/ISR capable).
- Authenticated users sign in via NextAuth (Credentials for now, OAuth later) stored in Postgres via Prisma.
- The backend (NestJS) exposes health endpoints and will gradually host API modules (users, projects, social,
  gamification). The web app can also read directly via Prisma where SSR is simpler; over time, move cross‑cutting logic
  to the API.

Public vs Authenticated Areas:

- Public: Home, Tutorial, Pricing, Public Stories Feed.
- Authenticated: Dashboard, Projects, Writing tools, Social.

---

## Technical Stack

Primary choices

- Frontend: Next.js 16 (App Router) + React 19 + TypeScript
- Auth: NextAuth v4 with Prisma Adapter (Credentials provider, OAuth ready)
- ORM/DB: Prisma 7.2 + PostgreSQL (using Driver Adapters)
- Backend: NestJS 11 (TypeScript) with modular DI, JWT-based API auth
- Editor: TipTap (rich-text WYSIWYG editor)
- Styling: Tailwind CSS + design tokens from `docs/design-tokens.json`
- State: TanStack Query for server state; React Context/hooks for local state
- Payments: Stripe Checkout (behind feature flag)

Why these choices (pros/cons)

- Next.js
  - Pros: SSR/SSG/ISR for the public feed, great DX, edge‑ready, file‑based routing (App Router), React Server
    Components.
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

## Key Features

### ✅ Implemented

**Authentication & Users**

- Email/password authentication (NextAuth Credentials provider)
- User profiles with username, bio, website
- Session management with JWT tokens
- API authentication using short-lived API JWTs (HS256, 10m expiry)

**Writing & Projects**

- TipTap rich-text editor with formatting tools
- Project CRUD with title, description, genre, content
- Word count tracking and automatic updates
- Four-tier visibility scopes: `PRIVATE`, `FRIENDS`, `PUBLIC_AUTHENTICATED`, `PUBLIC_ANYONE`
- Project settings and metadata (JSON)

**World-Building Entities**

- **Characters:** Name, bio, traits, quirks, character design images, flexible metadata (supports reference sheets for
  comics/graphic novels)
- **Locations:** Name, description, map/location reference images, metadata (environment design for visual storytelling)
- **Timeline Events:** Title, flexible date format, description, linked characters/locations (story beats or comic issue
  planning)
- **Dialogue Scenes:** Structured speaker/line content (JSON) perfect for comic scripts, screenplays, and visual
  dialogue planning
- All entities linkable to projects and each other
- Image URL support across entities for visual reference boards

**Gamification System**

- **Ink Currency:** Virtual currency system with InkPot wallets and transaction history
- **Goals:** Daily/weekly targets (word count for writers, panel/page count for comic creators) with progress tracking
- **Badges:** Milestone achievements (total words, pages completed, streaks, etc.) with award tracking
- **Progress Logging:** Timestamped activity tracking per goal—track writing sessions or comic production milestones

**Social Features**

- Follow/follower system with bidirectional relationships
- Public story feed (projects with appropriate visibility)
- Groups with admin/member roles
- User discovery and profile viewing
- Social endpoints: `/social/follow`, `/social/followers`, `/social/following`

**Payments (Feature Flag)**

- Stripe Checkout integration
- Webhook handling for subscription events
- Premium monthly/yearly pricing tiers
- Subscription status tracking on user model

**Developer Experience**

- Environment validation with Zod (API and Web)
- Shared Prisma schema across monorepo
- Health check endpoints
- CORS configuration
- Debug endpoints (development only)

### 🚧 Planned

**Writing Enhancements**

- Version history and rollback
- Autosave with conflict resolution
- Export to PDF/EPUB/Markdown
- Writing statistics and analytics dashboard

**World-Building Expansion**

- Character relationship graphs (family trees, social networks)
- Interactive timeline visualization
- World map integration with pinnable locations
- Cross-project entity sharing/templates
- Panel/page layout templates for comics
- Storyboard view for visual sequence planning
- Image gallery management for character designs and location references

**Gamification Enhancements**

- Daily streak system with recovery mechanics
- Break reminders and creative session timers
- Achievement unlocking animations
- Leaderboards (opt-in, friends-only)
- Customizable goal types: word count, panel count, page count, scene completion, character designs finished

**Social & Collaboration**

- Direct messaging (DMs)
- Comments on projects and entities
- Group projects with co-author permissions
- Activity feed (friends' writing updates)
- In-app notifications

**Mental Wellbeing**

- Configurable break reminders
- Anti-burnout detection
- Compassionate streak recovery
- Writing reflection prompts

**Technical Improvements**

- OAuth providers (Google, GitHub, Discord)
- Email verification and password reset
- Rate limiting on API endpoints
- Audit trails for sensitive actions
- Real-time collaboration with WebSockets

Access Scopes & Privacy Model

- Default scope per project with per-entity overrides
- Public feed surfaces only `PUBLIC_ANYONE` or `PUBLIC_AUTHENTICATED` content
- Friends-only content requires bidirectional follow relationship

Security Posture

- Session JWTs with NextAuth, API JWTs with 10m expiry
- Environment secrets validated with Zod
- CORS origin whitelisting
- Input validation on API endpoints
- Planned: rate limiting, audit trails, 2FA

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

- OAuth providers (web): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, `GITHUB_SECRET` (from provider
  consoles)
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
- In `web/.env.local`: `NEXTAUTH_SECRET=...`, `NEXTAUTH_URL=http://localhost:3000`, and
  `DATABASE_URL=postgresql://...` (same as root)
- In `api/.env`: `ALLOWED_ORIGINS=http://localhost:3000` and optionally `PORT=3001`

4) Install dependencies

```
cd web && npm install
cd ../api && npm install
cd ..
```

5) Generate Prisma client and run migrations

Because the Prisma schema lives in the repo root (`/prisma/schema.prisma`) while the web and api apps depend on
`@prisma/client`, run generate from each app and point to the shared schema file:

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

- Unit/E2E test scaffolding has not been added yet. This will land alongside the first protected routes and project
  CRUD.

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

## Environment variables

The web app calls the API using a short‑lived API JWT that contains the current user id. This token is minted
server‑side and sent as `Authorization: Bearer <token>`.

- Secret: `API_JWT_SECRET` must be set for both web (server environment) and api.
- Web helper: `web/src/lib/api.ts` provides `apiFetch(path, init)` which:
  - Reads the current session (`getServerSession`)
  - Signs `{ uid: <userId> }` using `API_JWT_SECRET` (HS256, 10m expiry)
  - Calls the API with the `Authorization` header
- API guard: `ApiAuthGuard` verifies the token and exposes `req.user.id` to controllers. Simple in‑memory read/write
  rate limits are applied to sensitive endpoints.

Example (server component / action):

```ts
import {apiFetch} from '@/lib/api';

const res = await apiFetch('/projects', {cache: 'no-store' as any});
const projects = await res.json();
```

Environment

- `API_JWT_SECRET=...` in `web/.env.local` and `api/.env`
- Keep this secret server‑only; do not expose to client code

---

## Payments (Stripe) — behind `payments` flag

Environment (API):

- `API_FEATURE_PAYMENTS=true`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PREMIUM_MONTHLY`
- `STRIPE_PRICE_PREMIUM_YEARLY`

Environment (Web):

- `NEXT_PUBLIC_FEATURE_PAYMENTS=true`

Flow:

- Web posts to `POST /api/checkout` (Next.js route) which proxies to API `POST /billing/checkout`.
- API creates a Stripe Checkout Session and returns the `url` for redirect.
- Webhook `POST /billing/webhook` verifies signature and, on `checkout.session.completed`, flips the user’s
  `subscriptionStatus` to `active`.

Local webhook test:

```
stripe listen --forward-to http://localhost:3001/billing/webhook
```

Note: success/cancel URLs default to `<ALLOWED_ORIGINS>/billing/return` with status query; you can pass explicit URLs in
the checkout request body if needed.

---

## Social — Follow/followers (MVP)

Schema:

- `Follow (id, followerId, followeeId, createdAt)` with unique `(followerId, followeeId)`.

API endpoints (guarded):

- `POST /social/follow` body `{ userId }` → toggles follow/unfollow, returns `{ following: boolean }`
- `GET /social/followers?userId=` → list of followers (defaults to current user)
- `GET /social/following?userId=` → list of accounts you follow (defaults to current user)

Web pages:

- `(main)/social/followers` — your followers
- `(main)/social/following` — who you follow

---

## Environment validation with Zod

- API: `src/config/env.ts` validates required env (e.g., `API_JWT_SECRET`, Stripe keys) with Zod; boot fails with a
  clear message if invalid.
- Web: `src/lib/env.ts` validates core env (`NEXTAUTH_*`, `API_URL`, `API_JWT_SECRET`, public flags) at first use.

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

If anything in this README is unclear or you encounter setup issues, please open an issue with details about your OS,
Node.js version, and logs.