# StoryForge — Remaining Gaps & Implementation Plan

> Last updated: May 22, 2026

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
| Documentation | 6 | 6 | 0 |
| Agent Infrastructure | 6 | 6 | 0 |
| i18n / Accessibility | 4 | 3 | 1 |
| **TOTAL** | **96** | **91** | **5** |

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

---

## Completed (May 22, 2026 — Rounds 1-3)

### Round 3 (this session)

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
