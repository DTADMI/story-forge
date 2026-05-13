# AGENTS.md

## Purpose

- Keep repo-loaded agent instructions short, stable, and enforceable.
- Use this file for hard repo rules only.
- Put procedural workflows in skills, runtime automation in hooks, and external system access in MCP/plugins.
- Read root `AGENTS.md` at the repo root for cross-project governance rules.
- Don't Do Evil. Never Do Evil.

## Operating Model

| Layer | Location | Use It For | Do Not Put Here |
| --- | --- | --- | --- |
| Rules | `AGENTS.md` | Stable repo policy, safety constraints, required guardrails | Long step-by-step playbooks, external integration setup |
| Hooks | `.codex/hooks.json`, `.githooks/pre-commit` | Automated reminders and enforced validation entrypoints | Product rules that need human judgment |
| Skills | `.agents/skills/` | Repeatable Story Forge workflows (to be populated as project matures) | Global policy, generic shell preferences |
| MCP / Plugins | `plugins/storyforge-integrations/`, `.agents/plugins/marketplace.json` | External system access and integration metadata | Repo policy or authoring standards |

## Repository Map

- `web/` Next.js App Router front-end (pages, components, styles)
- `api/` NestJS API server
- `prisma/` Prisma schema and migrations
- `scripts/` build, migration, and utility scripts
- `docs/` technical documentation
- `.github/` CI and workflow configurations

## Hard Rules

### Search And Shell

- Use `rg` first and by default for repo search.
- Scope searches and avoid heavy folders: `node_modules`, `.next`, `dist`, `.idea`.
- Never use `Get-ChildItem -Recurse | Select-String` for repo content search.
- For data-heavy work, prefer repo scripts over repeated manual tool calls when a script is practical.

### Change Safety

- Do not remove or overwrite user changes in a dirty worktree unless explicitly asked.
- Avoid editing generated output, `.next/`, `dist/`, or generated Prisma client files.
- Keep new product behavior behind feature flags and update docs accordingly.
- Growth ideas, themes, and events must remain feature-flag gated and controllable from the admin dashboard.

### Content Platform Rules

- Keep UI responsive and mobile-first across all surfaces; validate at `320px` minimum.
- Use original, thematic naming for story systems and keep names consistent across UI and docs.
- Story content must be specific, original, and engaging; do not use generic filler.
- All public-facing content must follow accessibility guidelines and avoid unsafe or disrespectful content.

### Migrations And Data

- Migrations are managed by Prisma Migrate and tracked in `prisma/migrations/`.
- Verify schema consistency across local, preview, and prod before and after DB-affecting changes.
- Every new model must have appropriate access control in the API layer.
- Do not expose raw database errors to API consumers.

### Validation, Docs, And Commits

- Keep documentation aligned with code and schema changes.
- In docs, keep exactly one empty line between a section title and the start of its table.
- Use real emoji characters in docs and keep docs UTF-8 clean.
- When code or docs change, create a concise commit unless the user says not to.

### Security And Privacy

- Do not log or expose secrets from `.env`, `.env.local`, or other environment files.
- Do not expose API keys, JWT secrets, or database connection strings in code or docs.

## Hooks And Enforced Checks

- Active Codex lifecycle hooks live in `.codex/hooks.json`.
- Repo Git hooks live in `.githooks/` and are installed by `node scripts/install-git-hooks.mjs` (or equivalent).
- The pre-commit hook runs `pnpm lint`, `pnpm build`, and `pnpm test`.

## MCP And Plugin Boundaries

- Repo-owned MCP/plugin metadata lives under `plugins/storyforge-integrations/` and `.agents/plugins/marketplace.json`.
- Current MCP target is GitHub.
- Use MCP for external context and inspection. Do not treat MCP as the source of truth for repo-side rollout scripts, migrations, or docs updates.
- Keep active runtime hooks in `.codex/hooks.json`; do not rely on plugin-local hooks for repo enforcement.
