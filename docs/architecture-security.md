# Architecture Decisions & Security Documentation

> Last updated: May 14, 2026

---

## 1. Database Architecture: Supabase + Prisma vs Naked Supabase

### Overview

| Dimension | Naked Supabase (QH pattern) | Supabase + Prisma (SF pattern) |
|---|---|---|
| **ORM** | None — `@supabase/supabase-js` + raw `pg` | Prisma 7.2 with `@prisma/adapter-pg` |
| **Access control** | RLS on every table (primary) | Application-level guards + RLS (defense-in-depth) |
| **Migrations** | Custom SQL + rollout/rollback pairs | Prisma Migrate |
| **Type safety** | Generated `Database` types | Prisma client types (auto-generated) |
| **Relation traversal** | Manual joins in SQL | `prisma.user.projects.characters` |
| **Realtime** | Native Supabase Realtime channels | Requires separate Supabase SDK calls |
| **Connection** | Supabase SDK (respects RLS) | Direct pg pool (bypasses RLS) |

### Recommendation

**StoryForge should keep Prisma + Supabase.** The data model has 19 models with deep relational nesting (Characters↔Timeline↔Locations↔Projects↔Users, bidirectional Follow, Groups↔Members). Prisma's relation traversal eliminates hundreds of lines of manual join logic. The trade-off — Prisma bypasses RLS — is mitigated by application-level guards in route handlers (`requireUser()` + `prisma.project.findFirst({ where: { userId: user.id } })`). RLS serves as defense-in-depth but is not the primary access control layer.

**QuestHunt should stay on naked Supabase.** QH's data model is flatter (quests, waypoints, puzzles, profiles) with tiered access (admin, creator, player, anonymous). RLS-first architecture is the correct choice because access patterns vary dramatically by tier, and RLS policies enforce this at the database level with zero application code. The custom SQL migration system gives precise control over complex Postgres functions (SECURITY DEFINER, search_path), which Prisma cannot express.

### Migration path (if switching)

If SF were to switch to naked Supabase:
1. Rewrite all Prisma queries to Supabase SDK calls (~200+ query sites)
2. Replace Prisma Migrate with custom SQL migrations
3. Generate Database types from Supabase CLI
4. Move all access control from route handlers into RLS policies
5. Estimated effort: 2-3 weeks. Risk: Medium. Not recommended.

If QH were to switch to Prisma:
1. Generate Prisma schema from existing DB
2. Replace Supabase SDK calls with Prisma queries (~500+ query sites)
3. Move RLS logic into application guards
4. Estimated effort: 3-4 weeks. Risk: High (RLS provides critical security). Not recommended.

### Concrete Code Examples: Same Operation, Two Approaches

**Example A: "Get a project with characters, timeline events, and locations"**

SF (Prisma) — 1 round-trip with deep includes:
```typescript
const project = await prisma.project.findFirst({
  where: { id, userId: user.id },
  include: {
    characters: true,
    locations: true,
    timelineEvents: {
      include: { characters: true, locations: true, dialogue: true },
    },
  },
});
// Single optimized SQL query. All nested data populated automatically.
```

QH equivalent — 4+ round-trips with manual stitching:
```typescript
const { data: quest } = await supabase.from("quests").select("*").eq("id", id).single();
const { data: waypoints } = await supabase.from("waypoints").select("*").eq("quest_id", id);
const { data: progress } = await supabase.from("quest_progress").select("*").eq("quest_id", id).eq("user_id", uid);
const { data: creator } = await supabase.from("profiles").select("*").eq("id", quest.created_by).single();
const enriched = { ...quest, waypoints, progress, creator };
```

**Example B: "Get timeline events with characters and locations"**

SF (Prisma) — 1 query:
```typescript
const events = await prisma.timelineEvent.findMany({
  where: { userId: user.id, projectId },
  include: { characters: true, locations: true },
});
```

QH activity feed — 3 round-trips + manual merge:
```typescript
const { data: activities } = await supabase.from("activities").select("*").range(0, 20);
const userIds = [...new Set(activities.map(a => a.user_id))];
const { data: profiles } = await supabase.from("profiles").select("*").in("id", userIds);
const { data: reactions } = await supabase.from("activity_reactions").select("*").in("activity_id", ids);
// Manual enrichment in JS
```

**Example C: "Get user badges with definitions"**

SF (Prisma) — 1 query:
```typescript
const badges = await prisma.userBadge.findMany({
  where: { userId: user.id },
  include: { badge: true },
});
```

QH — badge definitions in TypeScript constants, earned from DB, merged in code:
```typescript
const badgeDefs = BADGE_DEFINITIONS; // from @/lib/badges
const earned = await buildBadgeCatalogForUser({ admin, userId });
// Merge in application code
```

### Why This Matters

| Factor | SF (Prisma) | QH (Supabase SDK) |
|---|---|---|
| **Models** | 18 (small, dense graph) | 207 (large, wide, shallow) |
| **Depth** | 3 levels, many-to-many | 1-2 levels, flat FK |
| **Round-trips** | 1 per complex query | 3-5 per complex query |
| **ORM payoff** | High — `include` saves 3-5 round-trips | Low — flat queries are just `select().eq()` |
| **RLS** | Not needed (centralized API) | Critical (mobile, guest, roles) |
| **Switch cost** | 2-3 weeks | 3-4 weeks |

Neither should switch — each is optimal for its data model.

---

## 2. Security: CVEs and Mitigations

### Confirmed CVEs (as of May 14, 2026)

| CVE / GHSA | Severity | Description | Mitigation |
|---|---|---|---|
| **CVE-2025-66478** (React2Shell) | **CRITICAL (CVSS 10.0)** | RCE via React Server Components protocol | Upgraded to Next.js 16.0.10+ (Dec 2025). Confirmed: QH at 16.2.6, SF at 16.2.6 |
| **CVE-2025-55184** | HIGH | DoS via RSC connection exhaustion | Fixed in Next.js 16.0.10+ |
| **CVE-2025-55183** | MEDIUM | Source code exposure in RSC | Fixed in Next.js 16.0.10+ |
| **GHSA-26hh-7cqf-hhc6** | **HIGH** | Middleware bypass via segment-prefetch routes (May 2026) | Fixed in Next.js 16.2.6 |
| **GHSA-267c-6grr-h53f** | **HIGH** | Middleware bypass via segment-prefetch routes (May 2026) | Fixed in Next.js 16.2.6 |
| **GHSA-492v-c6pp-mqqv** | **HIGH** | Middleware bypass via dynamic route injection (May 2026) | Fixed in Next.js 16.2.6 |
| **GHSA-mg66-mrh9-m8jx** | **HIGH** | DoS via Cache Component connection exhaustion (May 2026) | Fixed in Next.js 16.2.6 |
| **GHSA-c4j6-fc7j-m34r** | **HIGH** | SSRF via WebSocket upgrades (May 2026) | Fixed in Next.js 16.2.6 |
| **GHSA-ffhc-5mcf-pf4q** | MODERATE | XSS via CSP nonces in App Router (May 2026) | Fixed in Next.js 16.2.6 |
| **GHSA-gx5p-jg67-6x7h** | MODERATE | XSS in beforeInteractive scripts (May 2026) | Fixed in Next.js 16.2.6 |
| **GHSA-h64f-5h5j-jqjh** | MODERATE | DoS in Image Optimization API (May 2026) | Fixed in Next.js 16.2.6 |
| **GHSA-wfc6-r584-vfw7** | MODERATE | Cache poisoning in RSC responses (May 2026) | Fixed in Next.js 16.2.6 |
| **GHSA-vfv6-92ff-j949** | LOW | Cache poisoning via RSC cache-busting (May 2026) | Fixed in Next.js 16.2.6 |

### Mitigation Status

| Project | Next.js Version | React Version | Status |
|---|---|---|---|
| **QuestHunt Web** | 16.2.6 | 19.2.5 | **All CVEs mitigated.** Running latest patch with all May 2026 fixes. |
| **StoryForge** | 16.2.6 | 19.2.5 | **All CVEs mitigated.** Updated from 16.2.2 to 16.2.6. |

### Additional Security Hardening

| Measure | Status | Notes |
|---|---|---|
| **Secret rotation** | Implemented | Procedure documented below. QH and SF are now on patched Next.js versions, but rotate secrets as a precaution if any were exposed during the React2Shell vulnerability window (pre-Dec 2025). |

### Secret Rotation Procedure

**When to rotate:** After any CVE remediation, suspected credential exposure, or quarterly.

**Secrets to rotate:**

| Service | Environment Variable | Rotation Method |
|---|---|---|
| Supabase JWT Secret | `SUPABASE_JWT_SECRET` (Project Settings > API) | Supabase Dashboard → Project Settings → API → JWT Settings → Generate New Secret |
| Supabase Service Role Key | `SUPABASE_SERVICE_ROLE_KEY` | Auto-rotated when JWT secret changes |
| Supabase Anon Key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auto-rotated when JWT secret changes |
| Stripe | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys → Roll key |
| Upstash Redis | `UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN` | Upstash Console → Database → Settings → Rotate Password |
| OpenRouter | `OPENROUTER_API_KEY` | [OpenRouter Keys](https://openrouter.ai/keys) → Regenerate |
| Neo4j | `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` | Neo4j Aura Console → Security → Reset Password |
| Vercel Deploy Hook | `VERCEL_DEPLOY_HOOK` (CI) | Vercel Dashboard → Settings → Git → Deploy Hooks → Regenerate |

**Rotation Steps:**

1. **Generate new secret** at the service provider dashboard
2. **Update Vercel env var** (Settings → Environment Variables) with the new value
3. **Verify in preview deploy** before applying to production
4. **Deploy to production** with the new values
5. **Delete old key/secret** at the service provider after confirming prod is stable
6. **Update `.env.example`** in the repo (do NOT commit actual secret values)
7. **Notify team** of rotation via standard channels

**Rollback:** If a service becomes unreachable after rotation, restore the previous env var value in Vercel and redeploy immediately.
| **CSP headers** | Recommended | Add `Content-Security-Policy` headers via Next.js middleware to mitigate XSS. Fixed in 16.2.6 but defense-in-depth with CSP is advised. |
| **Rate limiting** | Implemented | Redis-backed token-bucket rate limiting on all API routes. Tiers: AUTH (10/min), AI (30/min), WRITE (60/min), READ (300/min), PUBLIC (100/min). |
| **Admin access** | Implemented | `isAdmin()` check via `public.users.settings.is_admin` flag. Requires explicit opt-in per user. |
| **Feature flags** | Implemented | Redis-backed flags with admin UI. All AI and experimental features gated. Runtime toggling without redeploy. |
| **Server-only imports** | Enforced | `lib/supabase/server.ts`, `lib/admin.ts`, `lib/prisma.ts` use `import "server-only"` to prevent client-side leaks. |
| **RLS policies** | Implemented | Comprehensive policies on `users`, `projects`, `characters`, `locations`, `timeline_events`, `dialogues`, `follows`. See `supabase/migrations/002_create_app_tables.sql`. |

---

## 3. Rate Limiting Implementation

### Architecture

```
Request → withRateLimit(handler, tier)
              │
              ├─ Extract IP from x-forwarded-for header
              ├─ Check Redis sorted set: rate:<tier>:<ip>
              │    ├─ ZREMRANGEBYSCORE (remove old entries)
              │    ├─ ZCARD (count current window)
              │    ├─ If >= limit → 429 + Retry-After header
              │    └─ Else → ZADD + EXPIRE
              ├─ Redis unavailable → fail open (allow request)
              └─ Call handler
```

### Tier Configuration

| Tier | Max Requests | Window | Use Case |
|---|---|---|---|
| `AUTH` | 10 | 60s | Sign in, sign up |
| `AI` | 30 | 60s | AI writing suggestions |
| `WRITE` | 60 | 60s | Create/update operations |
| `READ` | 300 | 60s | List/get operations |
| `PUBLIC` | 100 | 60s | Unauthenticated endpoints |

### Usage Example

```typescript
// app/api/ai/suggest/route.ts
import { withRateLimit, RateLimitTiers } from "@/lib/rate-limit";

export const POST = withRateLimit(async (request: NextRequest) => {
  // ... handler logic
}, RateLimitTiers.AI);
```

### Comparison with QH

| Dimension | QuestHunt | StoryForge |
|---|---|---|
| **Algorithm** | Token bucket via Redis sorted sets | Same (matching implementation) |
| **Key format** | `admin:${userId}`, per-user | `rate:<tier>:<ip>`, per-IP |
| **Cost tracking** | Yes — tracks daily/monthly spend | Not yet (can be added) |
| **Granularity** | Per-admin-user with feature-specific limits | Per-IP with tier-based limits |
| **Fail mode** | Blocks on Redis failure | Fails open (allows request) |
| **Admin control** | Configurable via AI settings page | Configurable via constants + future admin UI |

---

## 4. Admin Dashboard

### Architecture

```
(app)/(admin)/
├── layout.tsx          → AdminLayout — checks isAdmin(), shows sidebar nav
├── dashboard/page.tsx  → Stats (users, projects, characters, groups) + recent lists
├── flags/page.tsx      → Feature flag toggles per category (client component, auto-saves)
├── users/page.tsx      → User table with role, status, project/character counts
└── moderation/page.tsx → Latest projects + characters for review

(app)/api/admin/
└── flags/route.ts      → GET/PUT — requires admin, reads/writes Redis
```

### Access Control

- `lib/admin.ts` exports `isAdmin()` and `requireAdmin()`
- `isAdmin()` checks: Supabase session → `public.users.settings.is_admin` or `is_moderator`
- All admin pages and API routes call `requireAdmin()` which throws 403 if not authorized
- Admin status is stored in `public.users.settings` JSONB field (not a separate table)

### To Grant Admin Access

```sql
UPDATE public.users
SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{is_admin}', 'true')
WHERE id = '<user-uuid>';
```

---

## 5. Dependency Version Matrix (May 14, 2026)

| Package | QH Version | SF Version | Latest Known | Notes |
|---|---|---|---|---|
| next | 16.2.6 | 16.2.6 | 16.2.6 | **Critical for CVE fixes** |
| react | 19.2.5 | 19.2.5 | 19.2.5 | |
| @supabase/ssr | 0.10.2 | 0.10.2 | 0.10.2 | |
| @supabase/supabase-js | 2.104.1 | 2.104.1 | 2.104.1 | |
| @upstash/redis | 1.37.0 | 1.37.0 | 1.37.0 | |
| @prisma/client | N/A | 7.2.0 | 7.2.0 | |
| prisma | N/A | 7.2.0 | 7.2.0 | |
| @tanstack/react-query | 5.100.1 | 5.100.1 | 5.100.1 | |
| tailwindcss | 4.2.4 | 4.2.4 | 4.2.4 | |
| typescript | 5.9.3 | 5.9.3 | 5.9.3 | |
| zod | 4.3.6 | 3.24.0 | 4.3.6 / 3.24.3 | SF on v3 for compatibility |
| vitest | 4.1.5 | 4.1.5 | 4.1.5 | |
| stripe | 20.4.0 | N/A (used in SF web) | 20.4.0 | |
| @tiptap/react | 3.22.4 | 3.14.0 | 3.22.4 | SF behind — upgrade pending |
