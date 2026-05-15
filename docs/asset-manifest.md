# StoryForge — Asset Manifest

> Generated: May 14, 2026 | License: MIT (all assets)

## Philosophy

All StoryForge assets are **inline SVG components** — no external downloads, no CDN dependencies, no binary files to track. This follows QuestHunt's approach of self-contained, version-controlled assets. Every SVG is hand-crafted, optimized, and embedded directly in TypeScript components for zero-latency rendering and tree-shaking.

## Asset Inventory

### 1. Brand / Logo

| Asset | File | Format | Size | License |
|---|---|---|---|---|
| StoryForge logomark | `components/assets/logo-mark.tsx` | Inline SVG | ~800B | MIT (original) |
| StoryForge wordmark | `components/assets/logo-wordmark.tsx` | Inline SVG | ~1.2KB | MIT (original) |

**Design:** A quill pen forming an "S" shape, with an ink drop. Minimal, monochrome, works at 16px favicon through 512px hero.

### 2. Badge Icons (Writing Milestones)

| Asset | Milestone | File |
|---|---|---|
| Quill (bronze) | 1,000 words | `components/assets/badge-quill-bronze.tsx` |
| Scroll (silver) | 5,000 words | `components/assets/badge-scroll-silver.tsx` |
| Book (gold) | 10,000 words | `components/assets/badge-book-gold.tsx` |
| Library (platinum) | 50,000 words | `components/assets/badge-library-platinum.tsx` |
| Galaxy (diamond) | 100,000 words | `components/assets/badge-galaxy-diamond.tsx` |
| Fire (streak 7 days) | 7-day streak | `components/assets/badge-fire.tsx` |
| Crown (streak 30 days) | 30-day streak | `components/assets/badge-crown.tsx` |

**Design:** Simple geometric shapes with thematic colors. 64x64 viewBox, stroke-based, scalable.

### 3. Genre Icons

| Asset | Genre | File |
|---|---|---|
| Dragon | Fantasy | `components/assets/genre-fantasy.tsx` |
| Rocket | Sci-Fi | `components/assets/genre-scifi.tsx` |
| Heart | Romance | `components/assets/genre-romance.tsx` |
| Magnifying glass | Mystery | `components/assets/genre-mystery.tsx` |
| Globe | Non-Fiction | `components/assets/genre-nonfiction.tsx` |
| Ghost | Horror | `components/assets/genre-horror.tsx` |

**Design:** 24x24 viewBox, stroke-based, consistent line weight. Used in project cards and genre breakdown charts.

### 4. Placeholder / Empty State

| Asset | Use Case | File |
|---|---|---|
| Default avatar | User without profile picture | `components/assets/avatar-default.tsx` |
| Empty book | No projects yet | `components/assets/empty-book.tsx` |
| Empty scroll | No characters/locations | `components/assets/empty-scroll.tsx` |
| Empty quill | No activity | `components/assets/empty-quill.tsx` |
| Empty chart | No stats | `components/assets/empty-chart.tsx` |

**Design:** Rounded, friendly, muted colors. 120x120 viewBox. Paired with EmptyState component text.

### 5. Social / OG Images

| Asset | Use Case | File |
|---|---|---|
| OG default | Social share fallback | `app/opengraph-image.tsx` |
| OG project | Project share card | Dynamic generation via route |

**Design:** Generated via `@vercel/og` or Next.js built-in OG image generation. Includes logomark + title text.

### 6. UI Utility Icons

All UI icons use `lucide-react` (already a dependency). No custom icons needed for standard UI (arrows, menus, toggles, etc.). The only custom assets are the domain-specific ones above.

## Licensing Summary

| Source | License | Count |
|---|---|---|
| **Original (hand-crafted SVG)** | MIT | 22 assets |
| **lucide-react** | ISC | All UI icons |

All original assets are MIT-licensed. No attribution required. No third-party icon fonts or CDN dependencies. All assets are version-controlled as TypeScript SVG components.

## Architecture Pattern

Each asset follows this pattern (matching QH's approach):

```tsx
// components/assets/badge-quill-bronze.tsx
export function BadgeQuillBronze({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* SVG paths */}
    </svg>
  );
}
```

Key principles:
- `aria-hidden="true"` on all decorative SVGs (accessibility)
- `className` prop for Tailwind styling
- `size` prop for responsive scaling
- No external dependencies (no `next/image`, no CDN)
- Tree-shakeable (only imported assets are bundled)
