# StoryForge — Remaining Gaps & Implementation Plan

> Last updated: May 23, 2026

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
| Testing & Quality | 6 | 4 | 2 |
| TanStack Migration | 2 | 2 | 0 |
| Documentation | 6 | 6 | 0 |
| Agent Infrastructure | 6 | 6 | 0 |
| i18n / Accessibility | 4 | 3 | 1 |
| **TOTAL** | **98** | **95** | **3** |

---

## Remaining Items

### LOW — Defer

| # | Item | Effort | Details |
|---|---|---|---|
| L1 | Accessibility audit (WCAG 2.1 AA) | 4h | ARIA labels, focus management, keyboard nav exist in auth forms + editor toolbar. Full audit across all 50+ pages needed. |
| L2 | Real-time document collaboration (CRDT/Yjs) | 12h+ | Realtime presence table exists in Prisma schema (`ProjectPresence`). Needs: document CRDT sync, cursor positions, awareness protocol, conflict resolution. |
| L3 | Expanded API test coverage | 4h | 13 test files now cover 8 domains (billing, users, projects, comments, gamification, world-characters, AI, social/groups). ~20 domains remain. |

---

## Completed (May 23, 2026 — Rounds 1-5)

### Round 5 (this session)

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
