# StoryForge — Systematic Verification Framework

> Last updated: May 22, 2026

## Purpose

Prevent the class of bugs where backend infrastructure exists but client code never triggers it — the "disconnected pipeline" anti-pattern (e.g., gamification progress API existed but no client ever called it).

## Verification Layers

| Layer | Script | What It Checks | CI |
|---|---|---|---|
| Integration trace | `scripts/verify-integration.ps1` | API endpoints with no client callers, client fetch calls with no API handler | ✓ |
| Feature flag gate | `scripts/verify-feature-flags.ps1` | Flags defined but never checked in code, flags checked but not defined | ✓ |
| Dead code | `scripts/verify-dead-code.ps1` | Files never imported, exports never referenced | Manual |
| Pipeline completeness | `scripts/verify-pipelines.ps1` | End-to-end feature flow validation (create → use → display) | ✓ |

## How It Works

### 1. Integration Trace (`verify-integration.ps1`)

Scans the codebase in two passes:

**Pass 1 — API Surface**: Finds all exported HTTP handlers in `app/api/`:
- Pattern: `export async function (GET|POST|PATCH|PUT|DELETE)` 
- Reports: method, route path, file location

**Pass 2 — Client Usage**: Finds all API calls in `app/` and `components/`:
- Pattern: `fetch(...)`, `/api/...` string literals
- Reports: method, URL path, source file location

**Cross-reference**: Produces a report of:
- **Orphaned endpoints**: API handlers with zero client callers (GAP — backend exists, no UI triggers it)
- **Missing handlers**: Client fetch calls to endpoints that don't have a handler file (GAP — UI calls, no backend)
- **Connected**: Both sides exist (OK)

### 2. Feature Flag Gate (`verify-feature-flags.ps1`)

Reads `lib/flags.ts` for all `id` values in `DEFAULT_FLAGS`. Then searches the codebase for each `id` appearing in `isEnabled()`, `isEnabledSync()`, or conditional checks.

Reports:
- **Ungated flags**: Flag defined but never checked in any component/API
- **Unknown flags**: Strings passed to `isEnabled()` that don't match any defined flag
- **Gated flags**: Flag defined AND checked (OK)

### 3. Pipeline Completeness (`verify-pipelines.ps1`)

Validates end-to-end feature pipelines:

**Gamification pipeline example:**
1. ✓ Editor saves content → `PATCH /api/projects/[id]` → `wordCount` updated
2. ✓ Autosave triggers → `POST /api/gamification/progress` → ProgressLog created
3. ✓ Progress route → Ink earned, badges awarded, streak calculated
4. ✓ Dashboard → reads Ink balance, badge count, streak
5. ✓ Leaderboard → reads aggregated progress

Each pipeline is defined in `scripts/pipelines.json` and verified automatically.

## Pipeline Definitions (`scripts/pipelines.json`)

```json
{
  "gamification": {
    "description": "Writing → Progress → Rewards → Display",
    "steps": [
      { "file": "components/editor/autosave-indicator.tsx", "calls": "POST /api/gamification/progress" },
      { "file": "app/api/gamification/progress/route.ts", "handler": "POST" },
      { "file": "app/(main)/dashboard/page.tsx", "reads": ["progressLog", "inkPot", "userBadge"] },
      { "file": "app/(main)/leaderboard/page.tsx", "reads": ["progressLog"] },
      { "file": "app/api/stats/overview/route.ts", "reads": ["progressLog", "inkPot", "userBadge", "goal"] }
    ]
  },
  "auth": {
    "description": "Sign Up → Verify → Sign In → Protected Routes",
    "steps": [
      { "file": "app/(auth)/signup/page.tsx", "calls": "supabase.auth.signUp" },
      { "file": "app/api/auth/signup/route.ts", "handler": "POST" },
      { "file": "app/(auth)/signin/page.tsx", "calls": "supabase.auth.signInWithPassword" },
      { "file": "middleware.ts", "guards": "protected routes" }
    ]
  },
  "social": {
    "description": "Follow → Activity → Feed",
    "steps": [
      { "file": "components/social/follow-button.tsx", "calls": "POST /api/social/follow" },
      { "file": "app/api/social/follow/route.ts", "handler": "POST" },
      { "file": "app/api/activity/feed/route.ts", "reads": ["follow", "activity"] },
      { "file": "app/(main)/social/followers/page.tsx", "calls": "GET /api/social/followers" }
    ]
  }
}
```

## Running Verification

```bash
# Run all checks
.\scripts\verify-integration.ps1
.\scripts\verify-feature-flags.ps1
.\scripts\verify-pipelines.ps1

# Or via pnpm
pnpm verify:all
```

## CI Integration

Verification runs in CI after the build step (see `.github/workflows/ci.yml`). Failures block merge.

## Adding a New Feature Pipeline

1. Add steps to `scripts/pipelines.json`
2. Run `pnpm verify:pipelines` locally to validate
3. The CI will catch any future disconnections

## Prevention Rules

1. **Every new API endpoint must have at least one client caller** — verified by integration trace
2. **Every new feature flag must gate at least one UI or API path** — verified by flag gate script
3. **Every data pipeline must be traceable end-to-end** — verified by pipeline check
4. **No dead exports** — verified by dead code check (manual, pre-commit)
