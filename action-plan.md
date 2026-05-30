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
├── app/              ← Next.js 16 App Router pages & API routes (76 route files)
├── components/       ← UI components (ui/, editor/, ai/, social/, world/, etc.)
├── lib/              ← Prisma, Supabase, Redis, flags, cache, AI, storage, rate-limit, yjs
├── i18n/             ← (deprecated) next-intl config — replaced by lib/i18n/ Context pattern
├── messages/         ← (deprecated) Translation JSON — replaced by lib/i18n/translations/
├── prisma/           ← Prisma schema (38 models) + migration history
├── supabase/         ← Supabase SQL migrations (11 files) + config
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

- [*] Complete client TanStack Query migration across remaining world CRUD, AI analysis, admin/auth, billing, and editor helper surfaces

---

## Planned

### Infrastructure & Tooling
- [ ] React 19.2 review
- [ ] Complete TanStack Query migration (remaining admin, auth, billing, editor surfaces)
- [ ] Real-time collaboration via Supabase Realtime (CRDT/Yjs) — Phase 2: document sync refinement, offline support

### Features
- [ ] Panel/page layout templates for visual storytelling

### Security & Compliance
- [ ] Rotate production secrets (CVE-2025-66478 / CVE-2025-55182)
- [ ] PII handling, data export/delete
- [ ] AI monitoring instrumentation

---

---
 
## 2026-05-29 Implementation Status

### Architecture
- i18n: Now using cross-project React Context pattern (`lib/i18n/`) — migrated from `next-intl`
- Default locale: `fr` (Quebec French) — respects Quebec language laws
- Single Next.js 16 App Router on Vercel with Supabase + Upstash Redis
- Prisma ORM with pg adapter on Supabase Postgres (38 models)
- Feature flags: 20 flags, Redis-backed, DB fallback
- TanStack Query migration: shared client API error parsing, suspense/error boundaries, mutation helpers

### Fixes Applied (2026-05-29)
- PPR: Added `experimental.ppr: 'incremental'` to next.config.mjs
- `optimizePackageImports`: Added `@radix-ui/react-slot`
- Lint: Cleared all 69 warnings (64 `no-explicit-any`, 3 `exhaustive-deps`, 1 `anonymous-default-export`, 1 `no-unused-vars`)
- Root layout: Added `force-dynamic` justification, dynamic `<html lang>` from locale
- middleware.ts: Created with security headers
- `docs/technical/performance-optimization.md`: Created with SSR strategy, caching layers, revalidation tiers

### i18n Migration (next-intl → Context Pattern)
- Created `lib/i18n/` (config, server, provider, server-provider, index)
- Created `lib/i18n/translations/en.ts` and `lib/i18n/translations/fr.ts` (220 keys each)
- Added Quebec French conventions ("courriel", "téléverser", "connexion", "mot de passe")
- Updated `app/layout.tsx`: `<html lang={locale}>`, `ServerI18nProvider` wrapper
- Updated `components/header/User.tsx`: `useI18n()` replaces `useTranslations()`
- Updated `components/editor/presence-avatars.tsx`: hardcoded "Viewers" → `t("social.viewers")`
- Updated `docs/technical/i18n-status.md`

### Competitions UI
- Created `app/(main)/competitions/page.tsx` — browse active/past competitions
- Created `app/(main)/competitions/[id]/page.tsx` — competition detail with entries
- Created `app/(main)/competitions/[id]/enter-form.tsx` — enter dialog with project selection
- Created `app/(main)/competitions/winners/page.tsx` — past winners showcase
- Created `components/competitions/competition-card.tsx` — card + enter dialog components

### Design System V2
- Created 14 new UI components: Accordion, Alert, Avatar, Checkbox, DropdownMenu, Label, Popover, Progress, RadioGroup/Select, Skeleton, Switch, Table, Tooltip
- Total UI components expanded from 9 to 23

### Flags Enabled/Changed
- 20 feature flags defined in `lib/flags.ts`
- `projects_v2` enabled
- `design_system_v2` disabled (never gated behavior — kept for future V2 gating)
- 5 AI feature flags (writing, character, plot, style, research)

---
 
## Completed (May 23, 2026 — Round 4)

### TanStack Query & UX shell
- [x] Shared client API error parsing + query client defaults
- [x] Shared query hooks expanded for suspense queries and client mutations
- [x] Query suspense/error boundary component
- [x] Quest Hunt-inspired dashboard shell/header/sidebar/mobile nav refresh
- [x] Migrated notifications, admin flags, world search, encyclopedia category builders, editor collaboration surfaces, group/profile flows, and core AI writing/character panels to TanStack Query / Mutation

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

## Completed (May 29, 2026 — Round 5)

### Real-Time Collaboration (CRDT/Yjs)
- [x] Installed `yjs`, `y-websocket`, `@tiptap/extension-collaboration`, `@tiptap/extension-collaboration-cursor`, `lib0`
- [x] Created `lib/yjs-provider.ts` — Yjs document provider using Supabase Realtime Broadcast for sync
- [x] Created `lib/yjs-collaboration.ts` — React hook (`useYjsCollaboration`) for collaborative editing
- [x] Created cursor awareness layer via `@tiptap/extension-collaboration-cursor` with colored user labels
- [x] Updated `components/editor/editor.tsx` — accepts optional `collaborationExtensions` and `editable` prop
- [x] Updated `components/editor/project-editor.tsx` — integrates collaboration hook, sync indicator
- [x] Updated `app/(main)/projects/[id]/page.tsx` — passes `currentUser` to `ProjectEditor`
- [x] Added collaboration cursor CSS styles to `styles/globals.css`
- [x] Feature-gated behind `real_time_collaboration` flag

### AI Monitoring
- [x] Created `lib/ai-monitoring.ts` — Redis-backed request metrics (latency, success rate, tokens, per-feature)
- [x] Created `app/api/ai/monitor/route.ts` — admin API endpoint for AI metrics dashboard
- [x] Updated `lib/ai.ts` — `wrapWithMonitoring` adapter records all AI requests automatically
- [x] Updated `lib/ai-types.ts` — added `_feature` field for per-feature tracking
- [x] Updated `app/api/ai/suggest/route.ts` — passes feature for monitoring

### Test Coverage Expansion
- [x] `__tests__/api/competitions.test.ts` — list, detail, enter, validation (7 tests)
- [x] `__tests__/api/messages.test.ts` — create, list, validation (5 tests)
- [x] `__tests__/api/notifications.test.ts` — list, mark read, mark all read (4 tests)
- [x] `__tests__/api/admin-flags.test.ts` — user list, flags, subscription update (4 tests)
- [x] `__tests__/api/world-building.test.ts` — locations, species, organizations CRUD (6 tests)

### Infrastructure
- [x] `middleware.ts` updated — removed unused parameter
- [x] All lint warnings/errors resolved — 0 warnings, 0 errors

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
