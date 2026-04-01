# Supabase Postgres Migration Plan

## Decision Summary

- Target: move `story-forge` database hosting to Supabase Postgres.
- Scope: keep application architecture (`Next.js web` + `Nest API` + `Prisma`) unchanged.
- Non-goal in this phase: replacing NextAuth or API authorization with Supabase Auth/RLS-first application logic.

## Why This Approach

| Option | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| Supabase as managed Postgres host only | Lowest migration risk, minimal code change, keeps Prisma model and auth flows stable | Does not immediately unlock full Supabase platform features | Adopt now |
| Full Supabase platform migration (Auth + RLS rewrite) | Unified BaaS primitives | High rewrite cost, access-model and API changes | Defer |
| Stay on current host | No migration work | Higher ops overhead and less platform tooling | Accept only if migration window blocked |

## Migration Phases

### Phase 0 - Prerequisites

- Create Supabase project (staging then production).
- Enable backups and point-in-time restore.
- Capture baseline metrics: connection count, p95 query latency, migration durations.

### Phase 1 - Staging Cutover

- Set staging `DATABASE_URL` to Supabase transaction pooler URL.
- Keep Prisma migrations running from CI/CD with `prisma migrate deploy`.
- Run full staging validation:
  - `pnpm -C web test:run`
  - `pnpm -C web build`
  - API dependency + migration sanity checks

### Phase 2 - Production Cutover

- Schedule low-traffic window.
- Freeze schema changes for cutover window.
- Apply latest migrations on Supabase production.
- Switch `DATABASE_URL` secrets in deployment targets.
- Run post-cutover smoke checks (auth, project CRUD, social feed, billing callback paths).

### Phase 3 - Stabilization

- Monitor DB metrics and API/web error rates for 48 hours.
- Reconcile orphaned/failed writes from cutover window.
- Close migration window after no critical incidents.

## Remaining Gaps and Tasks

| Status | Gap / Task | Owner | Notes |
| --- | --- | --- | --- |
| Done | CI workflows stabilized and deterministic pnpm setup added | Engineering | Reduced build/setup drift |
| Pending | Provision Supabase staging project and secrets | Ops | Required before data rehearsal |
| Pending | Define data migration rehearsal (snapshot restore + verification SQL) | Engineering | Must be repeatable |
| Pending | Add release checklist item for DB secret rotation and verification | Engineering + Ops | Prevent stale secret incidents |
| Pending | Evaluate optional `DIRECT_URL` pattern for Prisma migration connection | Engineering | Useful for pooled + direct split |

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Misconfigured pooled connection string | Validate connection with read/write smoke tests before cutover |
| Migration lock/contention during cutover | Freeze schema changes and run migrations before traffic switch |
| Hidden dependency on legacy DB host | Pre-cutover grep + config audit in CI and infra settings |

## Alternatives

- Neon Postgres for branch-heavy workflows.
- Railway Postgres for simplified app+db co-location.
- AWS RDS/Aurora for deeper infra control and enterprise policies.

## Recommendation

Proceed with Supabase **as managed Postgres hosting only** in the next sprint, then reassess full Supabase feature adoption after stable operations on the new host.
