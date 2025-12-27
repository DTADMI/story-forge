# StoryForge — Action Plan

This file tracks the actionable work for StoryForge, kept up to date based on the product objectives defined in
`README.md` and the detailed spec in `docs/story-forge-documentation.md`.

Legend:

- [ ] Planned
- [*] In Progress
- [x] Completed

---

## Completed

- [x] Monorepo scaffold with `web/` (Next.js + TS) and `api/` (NestJS + TS) with shared Prisma schema.
- [x] Basic documentation: `README.md` and `docs/story-forge-documentation.md` in place.
- [x] Environment template present for web app: `web/.env.example`.
- [x] UI primitives: initial Button component exists `web/src/components/ui/button.tsx`.
- [x] Set NextAuth to v4.24.13 (stay on pnpm) and migrate code to v4 patterns: shared `authOptions` in
  `web/src/lib/auth.ts`, route handler uses `NextAuth(authOptions)`, README/docs updated to v4 usage. Decision: do NOT
  switch to npm; track v5 stable and revisit later.
- [x] Authentication (MVP)
    - [x] Sign-in page at `web/src/app/(auth)/signin/page.tsx`.
    - [x] NextAuth v4.24.13 with Prisma adapter (Credentials) and JWT sessions; callbacks augment `session.user.id`.
    - [x] Password hashing with bcrypt and basic validation using Zod in the credentials flow.
    - [x] Sign-up API `POST /api/auth/signup` with Zod validation, email uniqueness check, bcrypt hashing; client page
      at `/signup` that auto signs in.
    - [x] Protected route pattern via `app/(main)/layout.tsx` + example `app/(main)/dashboard/page.tsx` including Sign
      out button.
- [x] Design System Foundations
  - [x] Define tokens file `docs/design-tokens.json` and map into Tailwind CSS variables.
  - [x] Tailwind v4.1 migration in web (configless/minimal), `globals.css` updated; PostCSS/Autoprefixer verified.
  - [x] Primitives: Button, Input, Card, Tabs; plus Textarea, Badge; polish states and a11y.
  - [x] Dark mode toggle (persisted + prefers-color-scheme).
  - [x] Demo pages: `/components-demo/tokens` and `/components-demo/ui`.
- [x] Config & Flags
  - [x] Feature flags scaffolding in `api/src/config/flags.ts`.
  - [x] Align web/api flags and shared keys (`web/src/lib/flags.ts`, `api/src/config/flags.ts`).
  - [x] Dev-only web flags endpoint at `web/src/app/api/debug/flags/route.ts` (404 in production).
- [x] Public Experience (Unauthenticated)
  - [x] Home/Marketing page (first pass with CTAs to Sign in, Pricing, Feed).
  - [x] Site shell with Header/Footer across public pages.
  - [x] Pricing page with payments-flag gated subscribe button.
  - [x] Public Feed empty state and sign-in prompt.
  - [x] Static pages: `/about`, `/faq`; nicer `/not-found` page.
- [x] CI (initial + enhancements)
  - [x] Add initial GitHub Actions workflow for web tests/build (Node 24.12.0, pnpm 10.26.0).
  - [x] Enhance CI: add web lint + typecheck and API tests + build.
- [x] Testing harnesses (baseline)
  - [x] Web: Vitest + RTL + jsdom with smoke tests (Home, Button, Feed).
  - [x] API: Jest + Supertest scaffold with `/projects` smoke test and CI wiring.
- [x] Dependency upgrade (round 2): align to specified versions — Node >=24.12.0, pnpm >=10.26.0; Web: Next.js 16.0.10,
  React 19.2.3, React DOM 19.2.3, @prisma/client 7.2.0, bcrypt 6.0.0, class-variance-authority 0.7.1, tailwind-merge
  3.4.0; Dev: @types/node 25.0.3, @types/react 19.2.7, autoprefixer 10.4.23, eslint 9.39.2, eslint-config-next 16.0.10,
  postcss 8.5.6, prisma 7.2.0, tailwindcss 4.1.18, typescript 5.9.3. API: @nestjs/\* 11.1.9, helmet 8.1.0,
  @prisma/client
  7.2.0; Dev: @nestjs/cli 11.0.14, @nestjs/schematics 11.0.9, @nestjs/testing 11.1.9, @types/node 25.0.3, typescript
  5.9.3. Updated README and docs.
- [x] Writing Tools (Projects) — MVP completion
  - [x] API: Prisma-backed CRUD (list by user, create, get, patch) with DTO validation (title, defaultScope)
  - [x] Web: `/projects` SSR list + create form using session user; `/projects/[id]` simple editor to update description
    and defaultScope
  - [x] Scopes: defaultScope enforced in API entity representation; public feed remains `public-anyone` only

- [x] Accounts & Profiles — MVP
  - [x] API: `GET /users/:id` and `PATCH /users/:id` to update `name`, `username`, `bio`, `website` with validation
  - [x] Web: `/profile` page (SSR) to view/update profile via server actions
  - [x] Docs: README/docs updated with routes and usage

- [x] Subscription — Foundations (flag-gated)
  - [x] API: `POST /billing/checkout` returns `{ url }` when `payments` is enabled; 404 when disabled (stub until
    Stripe)
  - [x] Web: `/api/checkout` proxy route; Pricing page Subscribe posts to proxy when `payments` is on
  - [x] Docs: README/docs updated (flag behavior and proxy)

- [x] Gamification & Wellbeing — MVP scaffolds
  - [x] Prisma: Add `Goal`, `ProgressLog`, `GemWallet`, `GemTx` models
  - [x] API: `GET /gamification/wallet?userId=` and `POST /gamification/progress` (stubbed rewards)
  - [x] Web: Profile shows Gems balance (read-only)
  - [x] Docs: sections added in docs and README

## In Progress

- [x] Subscription — Stripe Checkout (behind payments flag)
  - [x] API: Integrate Stripe Checkout Session in `POST /billing/checkout` (monthly/yearly)
  - [x] API: `POST /billing/webhook` with signature verification; set `subscriptionStatus`
  - [x] Web: proxy `/api/checkout` redirects to Checkout; `/billing/return` page shows status; gate premium UI
  - [x] Env/docs: Stripe envs (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PREMIUM_MONTHLY`,
    `STRIPE_PRICE_PREMIUM_YEARLY`) documented; Stripe CLI notes
  - [x] Tests: API unit/e2e mocking signature + event dispatch

- [x] Social & Messaging — Follow/followers foundations
  - [x] Prisma: `Follow (followerId, followeeId, createdAt)` with unique compound index
  - [x] API: `POST /social/follow` toggle; `GET /social/followers` and `/social/following` (paginated)
  - [x] Web: Followers/Following pages (MVP); follow/unfollow UI added to public user profile page
  - [x] Tests: API e2e for toggle and lists

- [x] Environment validation with Zod
  - [x] Web: `src/lib/env.ts` schema for `NEXTAUTH_*`, `API_URL`, `API_JWT_SECRET`, `NEXT_PUBLIC_FEATURE_*`
  - [x] API: `src/config/env.ts` migrate to Zod validation for API/Stripe/flags; fail fast with clear messages

- [x] Notifications prefs & wellbeing (MVP)
  - [x] Extend `User.preferences` JSON: quietHours, cadence, channels
  - [x] API: `PATCH /users/:id/preferences` (guarded) with validation
  - [x] Web: Profile > Notifications UI to edit preferences
  - [x] Tests: unit validation + e2e happy path

- [x] CI & Tooling
  - [x] Add Prisma generate in CI for both web and api
  - [x] Add safe `migrate deploy` (preview‑gated)
  - [x] Deployment notes (README/docs): Stripe envs, webhook setup, DB migration notes, quality gates

## Planned

### CI & Tooling

- [ ] Extend CI: add `prisma generate` on shared schema and consider migrate deploy step (safe path).
- [ ] Lint/Build verification on upgraded stack: fix ESLint 9.39 rule changes, TypeScript 5.9 typings, Next 16 build
  warnings, React 19.2 RSC constraints.
- [ ] Add Prettier + formatting check and Husky pre-commit hooks (optional).

### Accounts, Profiles, Subscription

- [ ] Sign-up flow and email verification (later), rate limiting.
- [ ] Profile page with settings, including default publication scope.
- [ ] Subscription/payments integration (Stripe) with feature gating.

### Privacy/Scopes Model

- [ ] Implement scopes: `private`, `friends`, `public-auth`, `public-anyone` at the project and item levels.
- [ ] Enforce scopes in queries and UI (feed visibility, share controls).

### Writing Tools (Post‑MVP expansions)

- [ ] Story editor (TipTap) with autosave and versioning
- [ ] Entities & world-building modules (iterative rollout):
  - [ ] Characters (profiles with traits/quirks)
  - [ ] Relationships graph (2D first; 3D nodes later) with editable labeled links
  - [ ] Locations & Maps (visual map later)
  - [ ] Timeline of events (title, dates, characters, description, linked dialogues)
  - [ ] Dialogues objects (participants, scripted dialogue, linkable to timeline events)
  - [ ] Additional encyclopedic modules: Research, Calendar, Magic, Fauna, Flora, Cultures, Items, Systems, Languages,
    Religions, Philosophies

### Social & Messaging — Foundations

- [ ] Prisma: `Follow` and `Friend` tables
- [ ] API: `POST /social/follow` toggle; `GET /social/followers` and `/social/following`
- [ ] Web: Profile tabs for Followers/Following; Follow button on user profile

### Gamification & Wellbeing (post‑MVP extensions)

- [ ] Earn/redeem gems for customization or gifts
- [ ] Notification cadence controls (email/SMS/push) with wellbeing guardrails
- [ ] Anti-burnout mechanisms (break nudges, focus modes, caps)

### Security & Compliance

- [ ] Input validation everywhere (Zod/class-validator), CORS, CSRF where needed.
- [ ] Rate limiting on auth and sensitive endpoints.
- [ ] Secrets management and env validation.
- [ ] Audit logging (later), PII handling, data export/delete.

### Testing

- [ ] Add initial tests for auth flows and scope enforcement (web + api).
- [ ] Add basic component a11y tests (focus-visible, ARIA) for primitives.

### Deployment & Infra

- [ ] Dev database with Prisma migrations; seed scripts.
- [ ] Deploy web to Vercel; API to Railway/Supabase/Neon Postgres.
- [ ] Observability basics (logs/metrics) and error reporting.
- [x] Add initial GitHub Actions workflow for web tests/build (Node 24.12.0, pnpm 10.26.0).
- [x] Enhance CI: add web lint + typecheck and API tests + build. Prisma generate/migrate to be added next.

### Upgrade Follow-ups (Migrations)

- [ ] React 19.2 review: remove legacy `use client` placement issues, verify new APIs; audit third-party libs for
  compatibility.
- [ ] Next.js 16 + NextAuth v4.24: verify middleware patterns and route handlers; audit any breaking changes when adding
  OAuth providers.
- [ ] Tailwind CSS 4.1: ensure styles compile; migrate any deprecated plugin/config usage.
- [ ] Prisma 7.2: run `prisma generate` and verify schema compatibility; adjust client imports/usages if required.
- [ ] NestJS 11.1 + RxJS 8: verify any Observable API changes; update interceptors/guards if signatures changed.
- [ ] ESLint 9.39: migrate config to flat config (if adopting) or update extends; fix breaking rule renames.

---

Notes

- Keep this plan synchronized with `README.md` and `docs/story-forge-documentation.md` whenever scope changes.
- When a task starts, move it to In Progress; when done, move it to Completed with a short note or link if helpful.
