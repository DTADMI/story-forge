# StoryForge — Action Plan

A gamified creative writing platform for novelists, screenwriters, comic creators, and visual storytellers. StoryForge
helps writers build consistent habits, craft immersive worlds, and share stories with granular privacy controls.

Whether you're writing novels, screenplays, comics, graphic novels, or webtoons, StoryForge provides comprehensive
world-building tools (characters with visual references, locations, timelines, dialogue/script scenes), visual asset
management, Duolingo-style gamification (goals, streaks, badges), and social features (groups, public feed) with mental
wellbeing safeguards.

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
  - [x] Prisma: Add `Goal`, `ProgressLog`, `InkPot`, `InkTx` models (Renamed from Gem/InkWallet)
  - [x] API: `GET /gamification/wallet` and `POST /gamification/progress`
  - [x] Web: Profile shows Ink balance
  - [x] Strategy: Pivot to cosmetic-only "Ink" system for habit building and social cheers. Stored in "Ink Pot".

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
  - [x] Implement "Cheers" (Social Motivators)

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
  - [x] Initial monorepo workspace setup with `pnpm-workspace.yaml`.

---

## Security Advisory (December 2025)

### CVE-2025-66478 / CVE-2025-55182 (React2Shell)

A critical vulnerability in React Server Components (RSC) was identified. StoryForge has been updated to Next.js 16.0.10
to mitigate this.

- [x] Upgrade Next.js to 16.0.10+ (Current: 16.0.10).
- [ ] **Action Required:** Rotate all environment secrets (API_JWT_SECRET, STRIPE_SECRET_KEY, NEXTAUTH_SECRET, etc.) in
  production environments.

## Completed (New)

### Writing Tools (Post‑MVP)

- [x] Story editor (TipTap) with autosave and versioning (MVP).
- [x] Extended Project model with `content` field.
- [x] API: PATCH `/projects/:id` supports `content` updates.

### Social & Messaging (Expansion)

- [x] "Friends" logic: reciprocal follow check in `SocialService`.
- [x] Web: Followers and Following list pages at `/social/followers` and `/social/following`.
- [x] Web: Public user profiles show accessible projects based on relationship (Friend/Public).

### Privacy & Security

- [x] Enforce `private`, `friends`, `public-auth`, `public-anyone` scopes in `ProjectsService`.
- [x] Input validation for Projects and Billing endpoints (max lengths, type checks).
- [x] Rate limiting (Read/Write) applied to all core API endpoints.
- [x] Centralized Prisma provider via `PrismaModule`.

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

- [x] Entities & world-building modules:
  - [x] Characters (profiles with traits/quirks, image URLs for character design references)
  - [x] Locations & Maps (with image URLs for location/environment references)
  - [x] Timeline of events foundation (story beats, comic issue planning)
  - [x] Dialogue objects (participants, scripted dialogue, linkable to timeline events—perfect for comic scripts and
    screenplays)
  - [ ] Relationships graph (2D first; 3D nodes later)
  - [ ] Additional encyclopedic modules: Research, Calendar, Magic, Fauna, Flora, Cultures, Items, Systems, Languages,
    Religions, Philosophies
  - [ ] Visual storytelling enhancements:
    - [ ] Panel/page layout templates for comics
    - [ ] Storyboard view for sequential art planning
    - [ ] Image gallery management for character designs and reference boards
    - [ ] Panel count tracking (alongside word count) for comic creators

### Social & Messaging — Foundations

- [x] Prisma: `Follow` and `Friend` tables
- [x] API: `POST /social/follow` toggle; `GET /social/followers` and `/social/following`
- [x] Web: Profile tabs for Followers/Following; Follow button on user profile
- [x] Groups foundation (Shared Goals)

### Gamification & Wellbeing (Habit Building)

- [x] Rename "Gems" to "Ink" (stored in "Ink Pot") in Prisma and codebase.
- [ ] Implement "Cheers" (Social Motivators):
  - [ ] API: `POST /social/cheer` sends a notification/ink to a friend.
  - [ ] Web: "Cheer" button on friend progress or profile.
- [x] Wellbeing Enhancements:
  - [x] Add "Break Reminder" setting in `User.preferences`.
  - [x] Client: Logic to detect long creative sessions and show nudges in Project Editor.
- [x] Milestone Badges:
  - [x] Prisma: `Badge` model and `UserBadge` join table.
  - [x] API: Award badges based on total word count milestones.
- [ ] Multi-format Goal Support:
  - [ ] Extend `Goal` model to support different types: `words_per_day`, `panels_per_day`, `pages_per_week`,
    `scenes_completed`
  - [ ] API: Track progress for different goal types (word count, panel count, page count)
  - [ ] Web: UI to select goal type when creating goals (writers vs. comic creators)

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
- [x] Prisma 7.2: Upgrade to Prisma 7, move DATABASE_URL to `prisma.config.ts`, and implement Driver Adapters.
- [x] Extend CI: add root-level `prisma generate` and `migrate deploy` compatible with Prisma 7.
- [ ] NestJS 11.1 + RxJS 8: verify any Observable API changes; update interceptors/guards if signatures changed.
- [ ] ESLint 9.39: migrate config to flat config (if adopting) or update extends; fix breaking rule renames.

---

Notes

- Keep this plan synchronized with `README.md` and `docs/story-forge-documentation.md` whenever scope changes.
- When a task starts, move it to In Progress; when done, move it to Completed with a short note or link if helpful.

## Completed (May 14, 2026)

### AI Integration

- [x] Shared AI package created: `packages/ai-core/` with `@story-forge/ai-core` (types, OpenRouter adapter, factory, base adapter)
- [x] Web wired to `@story-forge/ai-core` workspace dependency
- [x] AI feature flags: `aiWritingSuggestions`, `aiCharacterDevelopment`, `aiPlotAnalysis`, `aiStyleConsistency`, `aiResearchAssistant`
- [x] AI suggest API route: `POST /api/ai/suggest` — generic AI text generation with free model fallback
- [x] AI writing button component: `components/ai/ai-writing.tsx` — `AiWritingButton` + `AiSuggestPanel`
- [x] Project editor wired with AI writing suggestions button
- [x] Environment config updated: `OPENROUTER_API_KEY`, `NEXT_PUBLIC_SITE_URL` in env schema

### World-Building UI Completion

- [x] Character detail/edit page: `world/characters/[id]/page.tsx` — view/edit name, traits, quirks, bio, project; delete action
- [x] Location detail/edit page: `world/locations/[id]/page.tsx` — view/edit name, description, mapUrl, project; delete action
- [x] Timeline list page: `world/timeline/page.tsx`
- [x] Timeline create page: `world/timeline/new/page.tsx`
- [x] Timeline edit page: `world/timeline/[id]/page.tsx`
- [x] Dialogues list page: `world/dialogues/page.tsx`
- [x] Dialogues create page: `world/dialogues/new/page.tsx`
- [x] Dialogues edit page: `world/dialogues/[id]/page.tsx`
- [x] World overview page updated with timeline and dialogue section links

### API Endpoint Completion

- [x] Location GET by ID, PATCH, DELETE endpoints
- [x] Timeline GET by ID, PATCH, DELETE endpoints
- [x] Dialogue full CRUD (GET list, GET by ID, POST, PATCH, DELETE)

### Schema Updates

- [x] Dialogue model: added `user User?` relation, `project Project?` relation, `title` field
- [x] User model: added `dialogues Dialogue[]` relation
- [x] Project model: added `dialogues Dialogue[]` relation
- [x] `pnpm-workspace.yaml` created for monorepo workspace

## Completed — Supabase Architecture Migration (May 14, 2026)

### Infrastructure

- [x] Supabase project integration: `@supabase/ssr`, `@supabase/supabase-js` dependencies added
- [x] Supabase client layer: `lib/supabase/server.ts`, `client.ts`, `middleware.ts`, `admin.ts`
- [x] Supabase SQL migrations: `001_create_users_table.sql`, `002_create_app_tables.sql`, `003_storage_buckets.sql`
- [x] Upstash Redis integration: `lib/redis.ts` with no-op fallback for dev
- [x] Cache helper: `lib/cache.ts` — `getCached`, `setCached`, `invalidateCache`, `buildCacheKey`
- [x] Environment validation updated: `lib/env.ts` validates Supabase + Redis vars
- [x] `.env.example` updated with Supabase, Redis, OpenRouter, Stripe config

### Auth

- [x] NextAuth v4 completely removed — replaced by Supabase Auth
- [x] Sign-in page rewritten: Supabase `signInWithPassword` client component
- [x] Sign-up page rewritten: Supabase `signUp` with metadata + email redirect
- [x] Auth callback route: `api/auth/callback/route.ts` — exchanges code for session
- [x] Middleware: `middleware.ts` — Supabase session refresh + protected route guard
- [x] Protected layout: `(main)/layout.tsx` uses `getUser()` from Supabase
- [x] Header User component: replaced `useSession`/`signOut` with Supabase client
- [x] All 17 server pages updated: `getServerSession(authOptions)` → `getUser()`
- [x] Old auth files removed: `lib/auth.ts`, `api/auth/signup`, `api/auth/[...nextauth]`

### API Consolidation (NestJS → Next.js Route Handlers)

- [x] NestJS API removed as dependency — all 38 endpoints ported
- [x] `lib/api.ts` simplified — no JWT signing, uses cookie-based Supabase auth
- [x] Projects API: `GET/POST /api/projects`, `GET/PATCH /api/projects/[id]`
- [x] Users API: `GET/PATCH /api/users/[id]`
- [x] Gamification API: wallet, progress, goals, streak, badges
- [x] Social API: follow, followers, following, cheer, groups list+create, groups join+leave
- [x] World API: characters CRUD, locations CRUD, timeline CRUD, dialogues CRUD
- [x] Billing API: checkout session, Stripe webhook
- [x] AI API: `api/ai/suggest` — kept, now uses direct Prisma queries
- [x] Old proxy routes removed: checkout, social, billing proxies
- [x] 25+ API route handler files created

### Feature Flags

- [x] Redis-backed flag system: `lib/flags.ts` — 13 flags with types, categories
- [x] Flag types: boolean, percentage, user_list, subscription_tier
- [x] Graceful fallback: Redis → env vars → defaults
- [x] Categories: core, social, monetization, experimental, wellbeing, ai
- [x] API key normalization: `isEnabled()` / `isEnabledSync()`

### Data Layer

- [x] TanStack Query provider: `components/providers.tsx` — `QueryClientProvider` wrapper
- [x] Storage upload hook: `lib/storage.ts` — `useStorageUpload()` for Supabase Storage
- [x] Zod validation alignment: `lib/env.ts` uses Zod for all env vars

### CI/CD

- [x] CI updated: removed NestJS API job, single web job with lint+test+build
- [x] Build env vars updated: Supabase test keys for CI build

### Testing

- [x] API route test: `__tests__/api/projects.test.ts` — GET/POST with auth mocking

### Documentation

- [x] `AGENTS.md` fully rewritten: new architecture map, Supabase/Redis/RLS rules
- [x] `action-plan.md` updated with all migration completions
- [x] `.env.example` updated with full Supabase + Redis config
- [x] `supabase/migrations/` documented with 3 migration files
