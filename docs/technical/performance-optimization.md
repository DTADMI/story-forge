<!-- CLUSTER-C CANONICAL: NF-root rules. Project-specific delta below. -->
> **Canonical rules/process**: `../../../docs/technical/performance-optimization.md` (NF root). This doc keeps project-specific values/catalog only.
# StoryForge — Performance Optimization

**Last Updated**: 2026-06-18

## SSR Strategy

| Page Type | Strategy | Revalidation | Justification |
|---|---|---|---|
| Root Layout | `force-dynamic` | N/A | Auth-state-dependent UI, feature flag resolution, session-aware rendering |
| Public Pages (landing, about, FAQ) | Static + ISR | `revalidate: 86400` | Content changes infrequently; high traffic |
| Marketing Pages (tutorial) | Static + ISR | `revalidate: 86400` | Mostly static; updated rarely |
| Public Feed | ISR | `revalidate: 300` | Moderate update frequency, high traffic |
| Pricing | Static + ISR | `revalidate: 3600` | Updated occasionally |
| Auth Pages (signin, signup) | Static | N/A | Static UI, no dynamic data |
| Protected Pages (dashboard, projects) | Dynamic | N/A | Per-user data, cannot be cached |
| API Routes (read) | Stale-While-Revalidate via staleTimes | N/A | CDN cache for public reads |
| API Routes (write) | Dynamic | N/A | Must reflect real-time state |

## Caching Layers

| Layer | Technology | TTL | Scope |
|---|---|---|---|
| CDN (Vercel Edge) | Vercel Edge Cache | Respects `revalidate` / `staleTimes` | Static/ISR pages |
| Server Components | `React.cache()` | Per-render tree | Deduplicates DB/SDK calls within same render |
| Data Cache | Upstash Redis | Configurable per key (default 300s) | Feature flags, rate limits, session data |
| Browser Cache | HTTP headers + SWR | Next.js defaults | Client-side navigation |
| Database | Postgres query cache | PG defaults | Frequently accessed reference data |

## Revalidation Tiers

| Tier | `revalidate` (s) | `staleTimes.static` (s) | Examples |
|---|---|---|---|
| Static | 86400 | 300 | Landing, about, FAQ, tutorial |
| Slow ISR | 3600 | 300 | Pricing |
| Medium ISR | 300 | 30 | Public feed |
| Dynamic | 0 | 30 | Authenticated user pages, real-time data |

## Bundle Size Strategy

### `optimizePackageImports`
Configured in `next.config.mjs`:
- `lucide-react` — tree-shakes icon imports
- `date-fns` — tree-shakes date functions  
- `@radix-ui/react-slot` — tree-shakes slot primitive

### Code Splitting
- TipTap editor: dynamically imported via `next/dynamic` with `ssr: false`
- Neo4j driver: lazy-initialized, only loaded when graph features are enabled
- AI adapters: lazy-loaded per provider selection

### Image Optimization
- All user-uploaded images served through `next/image` with Supabase remote patterns
- `sharp` enabled for production image optimization

## Performance Monitoring

### Key Metrics
- **LCP** (Largest Contentful Paint): Target < 2.5s
- **FID** (First Input Delay): Target < 100ms
- **CLS** (Cumulative Layout Shift): Target < 0.1
- **TTFB** (Time to First Byte): Target < 800ms

### Optimizations Applied
- [x] `React.cache()` wrappers on `createServerClient()` and `getUser()` in `lib/supabase/server.ts`
- [x] Stale times configured (dynamic: 30s, static: 300s)
- [x] `optimizePackageImports` for lucide-react, date-fns, @radix-ui/react-slot
- [x] Security headers set (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- [x] `poweredByHeader: false` to reduce response size
- [x] `serverActions.bodySizeLimit: '2mb'` to prevent large uploads
- [x] `revalidate` exports on all 6 public/marketing pages with tiered values
- [ ] `cacheComponents: true` (PPR) — blocked by `revalidate` export incompatibility in Next.js 16.2.6
- [ ] `generateStaticParams` for high-traffic dynamic routes
- [ ] Vercel Analytics / Speed Insights integration

### PPR / `cacheComponents` Note
Next.js 16.2.6 merged `experimental.ppr` into `cacheComponents`. Enabling `cacheComponents: true` is incompatible with `revalidate` exports on pages — pages using `revalidate` must migrate to `staleTimes`-based cache lifetimes or `dynamic` config. This migration is deferred until Next.js provides a clear migration path for ISR pages under PPR.

## Database Performance

### Prisma
- Connection pooling via `@prisma/adapter-pg` with Supabase Postgres
- Paginated list queries (never unbounded)
- `take` + `cursor`-based pagination for public feeds
- Selected fields via `select` to reduce payload size

### Redis (Upstash)
- Token-bucket rate limiting with sliding windows
- Feature flag cache with lazy initialization
- Graceful fallback on Redis unavailability (fail-open)

### Neo4j
- Optional graph features, lazy-loaded
- Query results limited to 500 nodes

## Known Performance Gaps

1. Root layout `force-dynamic` prevents any static rendering — justified by auth-state dependency
2. `cacheComponents` not enabled — blocked by `revalidate` incompatibility with Next.js 16.2.6
3. No `generateStaticParams` for `/projects/[id]` or `/users/[id]` — these are dynamic per-user pages
4. No CDN caching headers on public API responses
5. AI feature calls are synchronous and may block SSR — consider streaming
