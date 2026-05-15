# Dependency Audit — StoryForge Web

> May 14, 2026

## Changes Made

### Removed Dependencies (3 packages)

| Package | Reason |
|---|---|
| `@tiptap/pm` | 0 direct imports. Already available as peer of `@tiptap/react`. |
| `tailwindcss-animate` | Replaced with 20 lines of inline CSS animation keyframes. Saves 1 dependency. |
| `@testing-library/user-event` | 0 imports in any test file. Unused. |

### Added Dependencies (2 packages)

| Package | Reason |
|---|---|
| `lucide-react` | Imported in 6 files (13 icons). Was undeclared — worked only by accident via transitive dep. |
| `clsx` | Imported in `lib/utils.ts`. Was available only transitively via `class-variance-authority`. Explicit is correct. |

### Home-Brewed Replacements

| Replaced | With | Complexity |
|---|---|---|
| `tailwindcss-animate` (1.0KB) | Inline `@keyframes` in `globals.css` (20 lines): `slide-in-right`, `slide-out-right`, `fade-in` | Trivial |
| `@tiptap/pm` | Nothing — already transitively available | Zero change |

### Kept (Assessed, Not Replaced)

| Package | Reason to Keep |
|---|---|
| `class-variance-authority` | 0.7KB gzipped. Used in button.tsx, badge.tsx. Standard shadcn/ui pattern. Not worth home-brewing. |
| `tailwind-merge` | Complex conflict resolution for Tailwind classes. Home-brew would be fragile. |
| `lucide-react` | Tree-shakeable (only 13 icons bundled). MIT license. Standard in React ecosystem. Home-brew would mean maintaining 13 SVG components. |
| `@tanstack/react-query` | Provides optimistic updates, caching, deduplication, background refetch. Used for admin flags toggling. Complexity not worth replicating. |
| `zod` | Type-safe validation. Used in 2 files. Could replace with manual validation but Zod is standard and well-maintained. |

### Stale Lockfile — Required Action

The root `pnpm-lock.yaml` is from an older `package.json` and still references removed deps:
- `@auth/prisma-adapter`, `bcrypt`, `next-auth`, `jsonwebtoken` (removed in Supabase migration)
- `@types/bcrypt`, `@types/jest`, `jest`, `ts-node` (removed)

**Fix:** Run `pnpm install` at workspace root. This will:
1. Install all current deps (including the 5 that are declared but not installed)
2. Remove stale lockfile entries
3. Resolve all version mismatches

```bash
cd B:\git\nebula-forge\story-forge
pnpm install
```

### 2D/3D Assets Assessment

| Type | Pertinence | Decision |
|---|---|---|
| **2D badges** | High — writing milestones | ✅ Created: 7 badge SVGs (Bronze→Diamond) |
| **2D genre icons** | High — project categorization | ✅ Created: 6 genre SVGs (Fantasy→Horror) |
| **2D empty states** | High — UX patterns | ✅ Created: 4 empty state SVGs |
| **2D logo/avatar** | High — branding | ✅ Created: logomark, default avatar |
| **2D cover templates** | Medium — project thumbnails | ⬜ Deferred to Phase 2 |
| **3D book model** | Low — no 3D viewer in app | ❌ Not pertinent. Adding Three.js for a loading screen asset would add 600KB+ for minimal UX value. |
| **3D quill/pen** | Low — would need Three.js | ❌ Not pertinent. Same rationale. |
| **3D world maps** | Low — would need Maplibre/Three.js | ❌ Not pertinent for a writing tool. |

**Rationale for no 3D:** StoryForge is a content-authoring tool, not a game. 3D assets would require Three.js (~600KB), react-three-fiber (~200KB), and a 3D viewer component. The UX benefit of a rotating 3D book or quill on a loading screen does not justify the bundle size penalty. QH needs 3D for puzzle stages and AR — SF doesn't have those features.

### Final Dependency Count

| Category | Before | After | Delta |
|---|---|---|---|
| Production deps | 18 | 17 | -1 |
| Dev deps | 17 | 14 | -3 |
| **Total** | **35** | **31** | **-4** |
