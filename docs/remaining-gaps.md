# StoryForge — Remaining Gaps & Implementation Plan

> Last updated: May 14, 2026

## Audit Summary

| Category | Total | Implemented | Remaining |
|---|---|---|---|
| Core Features | 18 | 16 | 2 |
| World-Building | 12 | 6 | 6 |
| Social & Collaboration | 10 | 6 | 4 |
| Gamification | 8 | 7 | 1 |
| Writing Tools | 8 | 5 | 3 |
| Media & Assets | 5 | 4 | 1 |
| Infrastructure & DevOps | 7 | 4 | 3 |
| Security & Compliance | 6 | 5 | 1 |
| Testing & Quality | 6 | 3 | 3 |
| Documentation | 6 | 6 | 0 |
| Agent Infrastructure | 6 | 6 | 0 |
| **TOTAL** | **92** | **68** | **24** |

---

## Remaining Items (Prioritized)

### HIGH — Implement Now

| # | Item | Effort | Files |
|---|---|---|---|
| **I1** | Character relationship graphs (2D) | 4h | Prisma model, API, SVG/Canvas graph component, page |
| **I2** | Achievement animations + badge showcase | 3h | Animation CSS, badge grid component, profile section |
| **I3** | Groups web UI | 3h | Group list/create/join/manage pages |
| **I4** | Multi-format goals UI + panel tracking | 2h | Goal type selector UI, panel counter in editor |
| **I5** | Interactive timeline visualization | 4h | Timeline component with drag/zoom, character/location linking |
| **I6** | Image gallery management UI | 2h | Gallery grid, upload button, drag-and-drop zone |
| **I7** | Direct messaging (1:1) | 5h | Message model, API, chat page, unread badge |
| **I8** | In-app notification center | 3h | Notification model, API, dropdown, badge count |
| **I9** | EPUB export + autosave enhancement | 3h | EPUB generator, autosave on interval |

### MEDIUM — Implement Next

| # | Item | Effort |
|---|---|---|
| **I10** | Profile enhancements (avatar, scope, share) | 3h |
| **I11** | Encyclopedic modules (7 schemas + pages) | 6h |
| **I12** | Accessibility audit + fixes | 3h |
| **I13** | Audit trails for sensitive actions | 2h |
| **I14** | Prettier + ESLint flat config | 2h |
| **I15** | Storyboard/panel layout view | 4h |

### LOW — Defer or Needs External Service

| # | Item | Effort | Blocker |
|---|---|---|---|
| **I16** | Share controls + cross-project sharing | 3h | — |
| **I17** | Email verification + notifications | 4h | Resend API key |
| **I18** | Real-time collaboration | 12h+ | Research CRDT/Yjs |

---

## Implementation Order

1. I3 (Groups UI) — API exists, just needs pages
2. I4 (Goals UI) — API updated, needs form
3. I2 (Achievements) — data exists, needs display
4. I6 (Image gallery) — API exists, needs UI
5. I8 (Notifications) — foundation for I7 (DMs use notifications)
6. I7 (Direct messages) — most complex, do after notifications
7. I1 (Character graphs) — self-contained visualization
8. I5 (Timeline viz) — self-contained visualization
9. I9 (EPUB + autosave) — utilities
10. I10-I16 — remaining polish
