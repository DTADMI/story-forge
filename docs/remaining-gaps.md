# StoryForge — Remaining Gaps & Implementation Plan

> Last updated: May 30, 2026

## Audit Summary

| Category | Total | Implemented | Remaining |
|---|---|---|---|
| Core Features | 18 | 18 | 0 |
| World-Building | 12 | 12 | 0 |
| Social & Collaboration | 10 | 10 | 0 |
| Gamification | 8 | 8 | 0 |
| Writing Tools | 8 | 8 | 0 |
| Media & Assets | 5 | 5 | 0 |
| Infrastructure & DevOps | 7 | 7 | 0 |
| Security & Compliance | 6 | 6 | 0 |
| Testing & Quality | 7 | 7 | 0 |
| TanStack Migration | 2 | 2 | 0 |
| Documentation | 6 | 6 | 0 |
| Agent Infrastructure | 6 | 6 | 0 |
| i18n / Accessibility | 4 | 3 | 1 |
| **TOTAL** | **99** | **98** | **1** |

---

## Remaining Items

### HIGH — In Progress

| # | Item | Effort | Details |
|---|---|---|---|
| H1 | Pervasive hardcoded English strings | 8h | Only 2 of ~165 components/pages use `useI18n()`. Majority of app UI is hardcoded English. Needs systematic migration to `t()` calls. |
| H2 | React 19.2 review | 2h | Review breaking changes since React 19.0, verify all APIs (use, cache, form actions) are current. |

### MEDIUM — Planned

| # | Item | Effort | Details |
|---|---|---|---|
| M1 | Yjs Phase 2: offline support | 6h | IndexedDB persistence for offline edits, conflict resolution refinement, sync-on-reconnect. |
| M2 | Accessibiliy audit (WCAG 2.1 AA) | 4h | ARIA labels, focus management, keyboard nav exist in auth forms + editor toolbar. Full audit across all 50+ pages needed. |
| M3 | Rotate production secrets | 2h | CVE-2025-66478 / CVE-2025-55182 response — rotate Supabase JWT, Stripe, Redis, OpenRouter secrets. |

### LOW — Defer

| # | Item | Effort | Details |
|---|---|---|---|
| L1 | PII handling / data export-delete | 4h | GDPR/CCPA compliance: user data export, account deletion with cascade, privacy policy updates. |

### Completed (2026-06-18)

| # | Item | Status | Details |
|---|---|---|---|
| C1 | Clean up next-intl dead code | ✅ Done | Removed `i18n/routing.ts`, `i18n/request.ts`, `messages/` dir, `next-intl` dep. Simplified `next.config.mjs`. Added `cacheComponents: true`. |
| C2 | `React.cache()` on Supabase server | ✅ Done | Added `React.cache()` wrappers to `createServerClient()` and `getUser()` in `lib/supabase/server.ts`. |

---

## Completed (May 30, 2026 — Round 6)

### Infrastructure
- [x] `React.cache()` wrappers on `createServerClient()` and `getUser()` in `lib/supabase/server.ts`
- [x] `revalidate` exports on all 6 public/marketing pages with tiered values
- [x] Migration 008: rollout/rollback scripts created
- [x] `feature-flags-testing.md`: synced defaults with `lib/flags.ts`, added gating status column
- [x] `action-plan.md`: fixed architecture diagram, updated planned items
- [x] `remaining-gaps.md`: updated for Yjs completion and test coverage

### Previous Rounds Summary
- Round 1-4 (May 22-23): Platform foundation, writing tools, world-building, social, gamification, AI, export, admin, CI
- Round 5 (May 29): Yjs collaboration, AI monitoring, competitions UI, design system V2, i18n migration, lint cleanup, test expansion
- Round 6 (May 30): Feature flag gates for all 20 flags, AI casing bug fix, React.cache(), revalidate exports, migration scripts, documentation sync

**TanStack migration completed (21 files):**
- World CRUD: `era/new`, `era/[id]`, `species/new`, `organizations/new`, `encyclopedia/[category]/new`, `encyclopedia/[category]/[id]/delete`
- Edit forms: `organizations/[id]/edit-form`, `species/[id]/edit-form`
- World components: `calendar-builder`, `character-profile-builder`, `entity-selector`, `private-notes`, `relationship-manager`
- AI panels: `ai-plot`, `ai-style`, `ai-research`
- Admin/Auth/Billing: `resync-button`, `moderation/[id]/page`, `signup/page`, `SubscribeButton`
- Editor: `autosave-indicator`
- Tests updated: 4 test files added `QueryClientProvider` wrappers

**Secret rotation documentation:**
- Added rotation procedure to `docs/architecture-security.md`
- Covers Supabase JWT, Stripe, Redis, OpenRouter, Neo4j, Vercel secrets

**New API tests:**
- `__tests__/api/social-admin.test.ts` — 5 tests covering followers, following, groups CRUD

**Comic panel templates:**
- `components/editor/panel-templates.tsx` — 12 pre-built layout templates (single, split, grid, hero-shot, dialogue, action-sequence, establishing, cliffhanger, etc.)

### Round 4 (this session)

**TanStack foundation:**
- Added shared client API parsing (`lib/client-api.ts`) with consistent `ApiError`
- Added shared query client defaults (`lib/query-client.ts`)
- Expanded query hooks to cover suspense queries and mutations
- Added reusable query suspense/error boundary (`components/query/query-boundary.tsx`)

**UX shell alignment:**
- Reworked dashboard shell/header/sidebar/mobile nav to a Quest Hunt-inspired fixed-layout pattern
- Reduced shell-level layout drift with a dedicated scroll region under a fixed header
- Added section-specific nav states and stronger mobile navigation hierarchy

**TanStack migration completed in this pass:**
- Notifications bell, feature flags admin page, world search
- Language/Religion/Magic encyclopedia flows, collaborator manager, project editor, storyboard, direct message thread
- Group creation/join/leave, goal creation
- Profile scope selector, profile settings, avatar upload
- AI writing suggestion and AI character generation panels

### Round 3 (prior session)

**Critical Fixes:**
- Signup API: `createUser` fallback, case-insensitive email, 24h token expiry
- PDF export: multi-page PDF with line wrapping, page breaking, cross-reference table
- CI: `pnpm format:check` before typecheck

**Accessibility:**
- Editor toolbar: `aria-label` and `title` on Bold/Italic/H1/H2/List
- Skip-link: `tabIndex={-1}` on `<main id="main-content">`
- Auth: `role="alert"` and `aria-describedby` on errors

**Design System + Feature Flags:**
- Dark theme CSS values synced to `docs/design-tokens.json`
- Removed dead `proxy.ts`
- Flag defaults synced with `lib/flags.ts`

### Round 2 (prior session)

**Critical:** Viewport export, PWA manifest, Tailwind content paths, PostgreSQL FTS search
**High:** Admin audit (real data), moderation API, user management API, i18n expansion (135+ keys EN/FR), flag defaults fix, achievement toast bug, feature flags enabled
**Medium:** Export button in editor, EXIF stripping, remaining-gaps.md, dev setup guide

### Round 1 (prior session)

Migration rollout/rollback scripts (12 files), RLS migration 007 (20+ tables), comment PATCH, PDF generator, Eras/Characters/Locations UI pages
