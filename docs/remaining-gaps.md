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
| Security & Compliance | 6 | 5 | 1 |
| Testing & Quality | 6 | 3 | 3 |
| TanStack Migration | 2 | 1 | 1 |
| Documentation | 6 | 6 | 0 |
| Agent Infrastructure | 6 | 6 | 0 |
| i18n / Accessibility | 4 | 3 | 1 |
| **TOTAL** | **98** | **92** | **6** |

---

## Remaining Items

### LOW — Defer

| # | Item | Effort | Details |
|---|---|---|---|
| L1 | Accessibility audit (WCAG 2.1 AA) | 4h | ARIA labels, focus management, keyboard nav exist; needs full audit |
| L2 | Real-time document collaboration (CRDT/Yjs) | 12h+ | Presence tracking exists; needs document sync, cursor positions |
| L3 | API test coverage for gamification, social, admin, world-building | 6h | 12 test files exist covering 6 domains; ~24 domains untested |
| L4 | Panel/page layout templates for comics | 3h | Storyboard component exists; needs template library |
| L5 | Rotate production environment secrets | 1h | CVE-2025-66478 / CVE-2025-55182 remediation |
| L6 | Complete client TanStack migration | 6h | Shared layer landed; remaining client fetches are concentrated in world CRUD helpers, AI analysis panels, and a few admin/auth flows |

### Remaining TanStack Migration Scope

| Area | Remaining files |
|---|---|
| World CRUD forms | `app/(main)/world/era/[id]/page.tsx`, `app/(main)/world/era/new/page.tsx`, `app/(main)/world/organizations/[id]/edit-form.tsx`, `app/(main)/world/organizations/new/page.tsx`, `app/(main)/world/species/[id]/edit-form.tsx`, `app/(main)/world/species/new/page.tsx`, `app/(main)/world/encyclopedia/[category]/new/page.tsx`, `app/(main)/world/encyclopedia/[category]/[id]/delete.tsx`, `components/world/calendar-builder.tsx`, `components/world/character-profile-builder.tsx`, `components/world/entity-selector.tsx`, `components/world/private-notes.tsx`, `components/world/relationship-manager.tsx` |
| AI panels | `components/ai/ai-plot.tsx`, `components/ai/ai-style.tsx`, `components/ai/ai-research.tsx` |
| Admin/Auth/Billing | `app/(admin)/admin/dashboard/resync-button.tsx`, `app/(admin)/admin/moderation/[id]/page.tsx`, `app/(auth)/signup/page.tsx`, `components/billing/SubscribeButton.tsx` |
| Editor helpers | `components/editor/autosave-indicator.tsx` |

---

## Completed (May 23, 2026 — Rounds 1-4)

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
- Notifications bell
- Feature flags admin page
- World search
- Language / Religion / Magic encyclopedia category flows with lazy-loaded builders + suspense
- Collaborator manager, project editor, storyboard, direct message thread
- Group creation, group join/leave, goal creation
- Profile scope selector, profile settings, avatar upload
- AI writing suggestion and AI character generation panels

### Round 3 (prior session)

**Critical Fixes:**
- Signup API: added `createUser` fallback for new users, case-insensitive email matching, 24h token expiry
- PDF export: replaced placeholder stub with genuine multi-page PDF (plain text extraction, line wrapping, page breaking, cross-reference table)
- CI workflow: added `pnpm format:check` step before typecheck

**Accessibility:**
- Editor toolbar buttons: `aria-label` and `title` on Bold, Italic, H1, H2, List buttons
- Skip-link: `tabIndex={-1}` on `<main id="main-content">` for focus landing
- Auth forms: `role="alert"` and `aria-describedby` on error messages in signin/signup pages

**Design System:**
- Dark theme CSS values synced to `docs/design-tokens.json` (6 color mismatches fixed)
- Removed dead `proxy.ts` file

**Feature Flags:**
- `projects_v2` enabled (code was complete)
- `design_system_v2` disabled (never gated behavior)
- Admin flags page defaults synced with `lib/flags.ts`

### Round 2 (prior session)

**Critical:** Viewport export, PWA manifest, Tailwind content paths, PostgreSQL FTS search
**High:** Admin audit (real data), moderation API, user management API, i18n expansion (135+ keys EN/FR), flag defaults fix, achievement toast bug, feature flags enabled
**Medium:** Export button in editor, EXIF stripping, remaining-gaps.md, dev setup guide

### Round 1 (prior session)

Migration rollout/rollback scripts (12 files), RLS migration 007 (20+ tables), comment PATCH, PDF generator, Eras/Characters/Locations UI pages
