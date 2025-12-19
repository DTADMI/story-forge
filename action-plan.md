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
- [x] Tech stack selected: Next.js 14, React 18, TypeScript, Prisma + PostgreSQL, NestJS, TanStack Query (planned
  usage), Tailwind (configured in dependencies), Zod.
- [x] Environment template present for web app: `web/.env.example`.
- [x] UI primitives: initial Button component exists `web/src/components/ui/button.tsx`.
- [x] Dependency upgrade (round 1): bumped Node engine to >=22, React to 19, Next.js to 15, Tailwind CSS to 4, Prisma to
  6, NextAuth to v5 stable, ESLint to 9, TypeScript to 5.7, NestJS to 11, Helmet to 8, RxJS to 8 across web/api. Updated
  README and docs to reflect versions.
- [x] Dependency upgrade (round 2): align to specified versions — Node >=24.12.0, pnpm >=10.26.0; Web: Next.js 16.0.10,
  React 19.2.3, React DOM 19.2.3, @prisma/client 7.2.0, bcrypt 6.0.0, class-variance-authority 0.7.1, tailwind-merge
  3.4.0; Dev: @types/node 25.0.3, @types/react 19.2.7, autoprefixer 10.4.23, eslint 9.39.2, eslint-config-next 16.0.10,
  postcss 8.5.6, prisma 7.2.0, tailwindcss 4.1.18, typescript 5.9.3. API: @nestjs/* 11.1.9, helmet 8.1.0, @prisma/client
  7.2.0; Dev: @nestjs/cli 11.0.14, @nestjs/schematics 11.0.9, @nestjs/testing 11.1.9, @types/node 25.0.3, typescript
  5.9.3. Updated README and docs.

## In Progress

- [*] Authentication (MVP)
    - [*] Sign-in page scaffold `web/src/app/(auth)/signin/page.tsx`.
  - [x] NextAuth v5 config with Prisma adapter (credentials provider) and session handling.
    - [ ] Auth routes (sign up, sign out) and protected routes patterns.
    - [ ] Password hashing with bcrypt and basic validation with Zod.

- [*] Design System Foundations
    - [*] Define tokens file `docs/design-tokens.json` and map into Tailwind CSS variables.
    - [ ] Tailwind v4.1 migration in web: adopt configless/default setup or minimal config, update `globals.css`, verify
      PostCSS pipeline with PostCSS 8.5.6 and Autoprefixer 10.4.23.
    - [ ] Build a small set of shadcn-like primitives (Button, Input, Card, Tabs) using tokens.

- [*] Config & Flags
    - [*] Feature flags scaffolding in `api/src/config/flags.ts`.
    - [ ] Align web/api flags and create a shared types contract.

## Planned

### Public Experience (Unauthenticated)

- [ ] Home/Marketing page with tutorial/overview of StoryForge.
- [ ] Public stories feed (SSR/ISR) showing items scoped as `public-anyone`.
- [ ] Pricing/subscription explainer pages.

### Accounts, Profiles, Subscription

- [ ] Sign-up flow and email verification (later), rate limiting.
- [ ] Profile page with settings, including default publication scope.
- [ ] Subscription/payments integration (Stripe) with feature gating.

### Privacy/Scopes Model

- [ ] Implement scopes: `private`, `friends`, `public-auth`, `public-anyone` at the project and item levels.
- [ ] Enforce scopes in queries and UI (feed visibility, share controls).

### Writing Tools (Projects)

- [ ] Projects CRUD with per-project default scope.
- [ ] Story editor (TipTap) with autosave and versioning later.
- [ ] Entities & world-building modules (iterative rollout):
    - [ ] Characters (profiles with traits/quirks).
    - [ ] Relationships graph (2D first; 3D nodes later) with editable labeled links.
    - [ ] Locations & Maps (visual map later).
    - [ ] Timeline of events (title, dates, characters, description, linked dialogues).
    - [ ] Dialogues objects (participants, scripted dialogue, linkable to timeline events).
    - [ ] Additional encyclopedic modules: Research, Calendar, Magic, Fauna, Flora, Cultures, Items, Systems, Languages,
      Religions, Philosophies.

### Social & Messaging

- [ ] Follow/friends, comments, groups, events.
- [ ] DMs and chat rooms; notifications & messaging preferences.

### Gamification & Wellbeing

- [ ] Goals, streaks, gem wallet prototype; earn/redeem for customization or gifts.
- [ ] Notification cadence controls (email/SMS/push) with wellbeing guardrails.
- [ ] Anti-burnout mechanisms (break nudges, focus modes, caps).

### Security & Compliance

- [ ] Input validation everywhere (Zod/class-validator), CORS, CSRF where needed.
- [ ] Rate limiting on auth and sensitive endpoints.
- [ ] Secrets management and env validation.
- [ ] Audit logging (later), PII handling, data export/delete.

### Testing

- [ ] Establish testing harnesses: unit (Jest/Vitest), component (React Testing Library), e2e (Playwright).
- [ ] Add initial tests for auth flows and scope enforcement.
- [ ] Lint/Build verification on upgraded stack: fix ESLint 9.39 rule changes, TypeScript 5.9 typings, Next 16 build
  warnings, React 19.2 RSC constraints.

### Deployment & Infra

- [ ] Dev database with Prisma migrations; seed scripts.
- [ ] Deploy web to Vercel; API to Railway/Supabase/Neon Postgres.
- [ ] Observability basics (logs/metrics) and error reporting.
- [ ] Update CI matrix to Node 24 LTS (24.12.0) and pnpm 10 (10.26.0); add `pnpm -w install`, web/api build steps, and
  prisma generate/migrate.

### Upgrade Follow-ups (Migrations)

- [ ] React 19.2 review: remove legacy `use client` placement issues, verify new APIs; audit third-party libs for
  compatibility.
- [ ] Next.js 16: check next-auth v5 configuration, middleware, and route handlers; apply codemods if needed.
- [ ] Tailwind CSS 4.1: ensure styles compile; migrate any deprecated plugin/config usage.
- [ ] Prisma 7.2: run `prisma generate` and verify schema compatibility; adjust client imports/usages if required.
- [ ] NestJS 11.1 + RxJS 8: verify any Observable API changes; update interceptors/guards if signatures changed.
- [ ] ESLint 9.39: migrate config to flat config (if adopting) or update extends; fix breaking rule renames.

---

Notes

- Keep this plan synchronized with `README.md` and `docs/story-forge-documentation.md` whenever scope changes.
- When a task starts, move it to In Progress; when done, move it to Completed with a short note or link if helpful.
