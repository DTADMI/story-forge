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

## Architecture

Single Next.js 16 App Router app on Vercel with Supabase (Auth, DB, Storage, Realtime) and Upstash Redis. Prisma ORM
with pg adapter on Supabase Postgres. Feature flags backed by Redis with env-var fallback.

```
story-forge/
├── app/              ← Pages, layouts, API route handlers (76 route files)
├── components/       ← UI components (ui/, editor/, ai/, social/, world/, gamification/, pwa/)
├── lib/              ← Prisma, Supabase, Redis, flags, cache, AI, storage, rate-limit
├── packages/
│   └── ai-core/      ← Shared AI package (OpenRouter adapter)
├── prisma/           ← Prisma schema + migrations
├── supabase/         ← Supabase SQL migrations (6 files) + config
├── scripts/          ← Migration rollout/rollback scripts, seed, agent tools
├── docs/             ← Technical documentation
└── .github/          ← CI workflow
```

---

## Completed

### Platform Foundation

- [x] Next.js 16 App Router with TypeScript, Tailwind CSS 4, Prisma 7 ORM
- [x] Supabase Auth (email/password, OAuth) — NextAuth v4 removed
- [x] Supabase client layer: server, client, middleware, admin
- [x] Upstash Redis with no-op dev fallback
- [x] Feature flags: 20 flags, Redis-backed, DB fallback, types, categories
- [x] Zod env validation (`lib/env.ts`)
- [x] `pnpm-workspace.yaml` for monorepo, `packages/ai-core/` shared AI package
- [x] Design system: Button, Input, Card, Tabs, Textarea, Badge, dark mode toggle
- [x] Design tokens (`docs/design-tokens.json`) mapped into Tailwind CSS variables
- [x] Public marketing pages: Home, About, FAQ, Pricing, Feed, 404

### Auth & Security

- [x] Sign-in, sign-up pages with Supabase Auth
- [x] Auth callback route for code exchange
- [x] Middleware for session refresh + protected route guard
- [x] Protected layout `(main)/layout.tsx` using `getUser()`
- [x] Rate limiting (token-bucket via Redis) on all core API endpoints
- [x] Audit event logging (`lib/audit.ts` + `AuditEvent` model)
- [x] Input validation via Zod across all endpoints
- [x] Scope enforcement: PRIVATE, FRIENDS, PUBLIC_AUTHENTICATED, PUBLIC_ANYONE

### Writing Tools (Projects)

- [x] Full CRUD API: `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/[id]`
- [x] TipTap editor with autosave and content versioning
- [x] Project list, detail, and editor pages
- [x] Scope-aware visibility in queries and UI
- [x] Storyboard view page (`projects/[id]/storyboard`)
- [x] Collaboration: collaborators API and management

### World-Building (Comprehensive)

- [x] **Characters**: Full CRUD API + Web UI (list, create, edit, detail)
- [x] **Locations**: Full CRUD API + Web UI (list, create, edit, detail)
- [x] **Timeline**: Full CRUD API + list/create/edit pages + visualization
- [x] **Dialogues**: Full CRUD API + list/create/edit pages
- [x] **Organizations**: Full CRUD API + list/create/edit pages
- [x] **Species**: Full CRUD API + list/create/edit pages
- [x] **Calendar**: Full CRUD API + list/create/edit pages + builder component
- [x] **Eras**: Full CRUD API
- [x] **Encyclopedia**: Entries by category (research, magic, fauna, etc.) + images
- [x] **Character relationships**: API + relationship manager + family tree components
- [x] **Image upload**: Character/location/organization/species/location images
- [x] **Galaxy view**: Graph visualization of world entities
- [x] **World search**: Full-text search across world entities
- [x] **World export**: Export world data
- [x] **Shared content**: Cross-project sharing
- [x] Specialized builders: magic system, religion, language, character profile

### Social Features

- [x] Follow/unfollow with toggle API
- [x] Followers and following list pages
- [x] Follow button component on user profiles
- [x] Writing Groups: CRUD API + list/create/detail/manage pages
- [x] Direct Messages: API + list/thread pages
- [x] Notifications: API + notification center page
- [x] Cheers (social motivators): API + cheer button component
- [x] User blocking: API endpoint
- [x] Project favorites and voting
- [x] Comments: Create/Read/Delete on projects (threaded)
- [x] Activity feed: API + follows-based aggregation
- [x] Public story feed
- [x] Share button component

### Gamification & Wellbeing

- [x] Ink Pot / InkTx currency system (cosmetic, habit-building)
- [x] Goals with type field (words_per_day, panels_per_day, etc.)
- [x] Progress logging with streak calculation
- [x] Milestone badges with award logic
- [x] Badge showcase on profile
- [x] Writing statistics dashboard (`/stats`) with trends
- [x] Leaderboard (friends-only, opt-in)
- [x] Wellbeing features: break reminders, anti-burnout
- [x] Achievement toast component

### Monetization

- [x] Stripe Checkout integration (monthly/yearly/lifetime)
- [x] Stripe webhook with signature verification
- [x] Subscription tier gating (`lib/permissions.ts`)
- [x] Billing return page
- [x] Feature-flagged behind `payments` flag

### AI Integration

- [x] Shared AI package (`packages/ai-core/`) with OpenRouter adapter
- [x] AI writing suggestions button in project editor
- [x] AI suggest API: `POST /api/ai/suggest`
- [x] 5 AI feature flags (writing, character, plot, style, research)

### Export

- [x] Markdown export (via TipTap HTML → Markdown)
- [x] EPUB3 export (custom ZIP builder, cover, TOC, CSS)
- [x] PDF HTML export (print-oriented CSS, @page rules)

### Admin Dashboard

- [x] Admin dashboard, users list, user detail
- [x] Feature flag management UI (`/admin/flags`)
- [x] Subscription management
- [x] Audit log viewer
- [x] Moderation queue
- [x] Neo4j resync admin action

### Infrastructure & DevOps

- [x] CI workflow (GitHub Actions): typecheck, test, build on PR/push
- [x] Pre-commit hook: format, lint, typecheck, test, build
- [x] Supabase SQL migrations (6 files) with RLS policies
- [x] Migration rollout/rollback scripts for all 6 migrations
- [x] Seed script (`scripts/seed.mjs`)
- [x] Agent search script (`scripts/agent-search.ps1`)
- [x] Codex hooks (session-start, stop-review)
- [x] Docker Compose for local development
- [x] pnpm workspace configuration

### Documentation

- [x] `AGENTS.md` with architecture map, hard rules, Supabase/Redis/RLS rules
- [x] `docs/story-forge-documentation.md` — comprehensive platform spec
- [x] `docs/technical/feature-flags-testing.md` — flag testing guide
- [x] `docs/remaining-gaps.md` — prioritized gap assessment
- [x] `docs/feature-recommendations.md` — feature roadmap with cost/benefit
- [x] Specialized docs: architecture-security, database analysis, email plan, OAuth analysis, realtime research, Discord phase 2 plan
- [x] `.env.example` with full config (Supabase, Redis, OpenRouter, Stripe, Neo4j, Resend)

### Testing

- [x] Vitest + RTL + jsdom test harness
- [x] Component tests: Button, Home, Feed, SignIn, DarkModeToggle, SubscribeButton
- [x] API tests: Projects, Users, Billing checkout, Billing webhook, Comments, World Characters

---

## In Progress

---

## Planned

### Feature Gaps

- [ ] **Panel/page layout templates** — Comic panel templates for visual storytelling
- [ ] **Real-time collaboration** — Document sync via CRDT/Yjs (presence tracking exists)

### Infrastructure & Tooling

- [ ] React 19.2 review: verify new APIs, audit third-party lib compatibility
- [ ] Accessibility audit: WCAG 2.1 AA comprehensive review
- [ ] Real-time collaboration via Supabase Realtime (CRDT/Yjs)

### Security & Compliance

- [ ] Rotate production environment secrets (CVE-2025-66478 / CVE-2025-55182)
- [ ] PII handling, data export/delete

### Testing

- [ ] Gamification API tests (goals, progress, badges, streak, wallet)
- [ ] Social API tests (follow, groups, messages, notifications)
- [ ] Admin API tests (users, flags, moderation)
- [ ] World-building API tests (locations, species, organizations, eras, calendar, dialogues, timeline, encyclopedia)

---

## Completed (May 22, 2026 — Round 3)

### Critical Fixes
- [x] Signup route: fixed `createUser` fallback + case-insensitive email match + token expiry
- [x] PDF export: replaced stub with real multi-page PDF generation (plain text extraction, line wrapping, pagination)
- [x] CI workflow: added Prettier format check step

### Accessibility
- [x] Editor toolbar buttons: added `aria-label` and `title` to all formatting buttons
- [x] Skip-link: added `tabIndex={-1}` to `<main>` for keyboard focus landing
- [x] Auth pages: added `role="alert"` and `aria-describedby` to form error messages

### Design System
- [x] Dark theme CSS: synced all 6 mismatched color tokens with `docs/design-tokens.json`
- [x] Removed dead `proxy.ts` file

### Feature Flags
- [x] `projects_v2` enabled (code was complete but flag was off)
- [x] `design_system_v2` disabled (never gated any behavior; clean up later)
- [x] Admin flags page defaults synced with `lib/flags.ts`

### email Verification
- [x] Verification token includes 24h expiry timestamp

---

## Security Advisory

### CVE-2025-66478 / CVE-2025-55182 (React2Shell)

A critical vulnerability in React Server Components (RSC) was identified. StoryForge has been updated to Next.js 16.0.10+
to mitigate this.

- [x] Upgrade Next.js to 16.0.10+ (Current: 16.2.6)
- [ ] **Action Required:** Rotate all environment secrets in production environments

---

## Notes

- Keep this plan synchronized with `README.md` and `docs/story-forge-documentation.md` whenever scope changes.
- When a task starts, move it to In Progress; when done, move it to Completed with a short note or link if helpful.
- All new features must be feature-flagged (see `docs/technical/feature-flags-testing.md`).
