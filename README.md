
Workflow: `.github/workflows/ci.yml`

- Steps: checkout → setup Node (corepack pnpm) → `pnpm -w install` →
  - `pnpm -C web test:run` → `pnpm -C web lint` → `pnpm -C web build`
  - `pnpm -C api test:ci` → `pnpm -C api build`
- Next enhancements (planned): add `prisma generate` on the shared schema and migrate deploy step.

---

## Feature Flags

Feature flags allow enabling/disabling areas incrementally across web and API.

Web (client-visible):

- Defined via `NEXT_PUBLIC_FEATURE_*` env vars (see `web/.env.example`).
- Consumed through `web/src/lib/flags.ts` which exports `flags` and `isEnabled(key)`.

API (server-only):

- Defined via `API_FEATURE_*` env vars (see `api/.env.example`).
- Read in `api/src/config/flags.ts` exporting `apiFlags` and `isApiFlagEnabled(key)`.

Shared keys: `payments`, `aiAssist`, `projectsV2`, `wellbeing`, `designSystemV2`.

---

## Deployment

MVP recommendation: Vercel (web) + Railway (API) + Supabase/Neon (Postgres)

Environment preparation
- Create a production Postgres (Supabase/Neon). Copy the `DATABASE_URL`.
- Generate unique `NEXTAUTH_SECRET`.
- Decide canonical URLs: `WEB_URL` and `API_URL`.

Web (Vercel)
1. Import the `web/` app in Vercel and set:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` = your production web URL (e.g., `https://app.storyforge.app`)
   - `DATABASE_URL` = your production Postgres URL
2. Build & deploy. Configure a custom domain if desired.

API (Railway)
1. Create a new service from the `api/` folder.
2. Set env vars:
   - `DATABASE_URL`
   - `ALLOWED_ORIGINS` = your web app URL(s)
   - `PORT` = `3001` (or leave default)
3. Deploy. Ensure the service is reachable and health endpoints respond.

Database migrations in production
```
# Option A (one‑off): run from a CI job or a local machine with prod DATABASE_URL
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Option B: add a deploy step in CI that runs the above
```

Alternative single‑cloud deployment
- Fly.io can host the web, API, and Postgres together with low‑latency multi‑region scale.

---

## Troubleshooting

- Prisma generate errors from web/api
  - Ensure you pass `--schema=../prisma/schema.prisma` when running from `web/` or `api/`.
  - Verify `@prisma/client` is installed in the app you’re running generate from.

- NextAuth errors about missing secret or URL
  - Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in `web/.env.local` (and in Vercel for prod).

- Cannot connect to Postgres
  - Check `DATABASE_URL`, DB is running, credentials correct, and firewall/SSL settings for hosted DBs.

- CORS failures when calling API from Web
  - Ensure `ALLOWED_ORIGINS` includes `http://localhost:3000` (dev) or your production web origin(s).

---

## Contributing & Coding Standards

- Language: TypeScript across the stack.
- Style: ESLint + Prettier (config will be added). Align with existing patterns and file layout.
- Commits: conventional, small, and descriptive; include scope when possible.
- Security: never commit secrets; prefer `.env.local` and CI secrets.
- Branching: feature branches with PRs; enable preview deploys when possible.

---

## References

- Full product/architecture spec: `docs/story-forge-documentation.md`
- Design tokens & palette: `docs/design-tokens.json`
- Prisma schema: `prisma/schema.prisma`
- NextAuth route handler: `web/src/app/api/auth/[...nextauth]/route.ts`
- Sign‑in page (Credentials): `web/src/app/(auth)/signin/page.tsx`
- Nest API bootstrap: `api/src/main.ts` and `api/src/app.module.ts`

If anything in this README is unclear or you encounter setup issues, please open an issue with details about your OS, Node.js version, and logs.

### Public routes (unauthenticated)

- `/` — Marketing home and overview
- `/pricing` — Pricing & subscriptions explainer
- `/feed` — Public stories feed (SSR placeholder, scoped to `public-anyone`)
- `/components-demo` — Internal demo page for UI primitives (temporary)
- `/components-demo/tokens` — Tokens reference page
- `/components-demo/ui` — UI primitives showcase
- `/about` — About StoryForge
- `/faq` — Frequently Asked Questions

### Authenticated routes (initial)

- `/projects` — Manage your writing projects (list/create)
- `/projects/[id]` — Project details (edit basics)
- `/profile` — View and update profile (name, username, bio, website)

### API (selected endpoints added in this iteration)

- Web proxy: `POST /api/checkout` → forwards to API billing checkout when `payments` flag is enabled
- API: `POST /billing/checkout` → returns `{ url }` (stub) when `payments` is enabled; 404 when disabled
- API: `GET /users/:id` and `PATCH /users/:id` → fetch and update profile fields
- API: `GET /gamification/wallet?userId=` → returns `{ userId, balance }`
- API: `POST /gamification/progress` → logs progress and may reward gems (stub logic)

### Styling & Design Tokens

- Tailwind CSS 4.1 configless setup with `@tailwind base; @tailwind components; @tailwind utilities;` in
  `web/src/styles/globals.css`.
- Design tokens are exposed as CSS variables (e.g., `--bg`, `--fg`, `--brand`) and mapped to utility-like classes
  (`bg-bg`, `text-fg`, `text-sm`, `shadow-elev-1`, etc.) for ergonomic usage without a Tailwind config.
- Dark mode uses the `.dark` class toggling token values. A client `DarkModeToggle` is available at
  `web/src/components/dark-mode-toggle.tsx` and persists preference while respecting `prefers-color-scheme`.

### Feature Flags (dev-only surfaces)

- Web debug flags endpoint (dev only): `GET /api/debug/flags` → `{ env, flags }`. Hidden in production (404).

## API authentication from Web → API (server-side)

The web app calls the API using a short‑lived API JWT that contains the current user id. This token is minted
server‑side and sent as `Authorization: Bearer <token>`.

- Secret: `API_JWT_SECRET` must be set for both web (server environment) and api.
- Web helper: `web/src/lib/api.ts` provides `apiFetch(path, init)` which:
    - Reads the current session (`getServerSession`)
    - Signs `{ uid: <userId> }` using `API_JWT_SECRET` (HS256, 10m expiry)
    - Calls the API with the `Authorization` header
- API guard: `ApiAuthGuard` verifies the token and exposes `req.user.id` to controllers. Simple in‑memory read/write
  rate limits are applied to sensitive endpoints.

Example (server component / action):

```ts
import {apiFetch} from '@/lib/api';

const res = await apiFetch('/projects', {cache: 'no-store' as any});
const projects = await res.json();
```

Environment

- `API_JWT_SECRET=...` in `web/.env.local` and `api/.env`
- Keep this secret server‑only; do not expose to client code
