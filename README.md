
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

---

## Payments (Stripe) — behind `payments` flag

Environment (API):

- `API_FEATURE_PAYMENTS=true`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PREMIUM_MONTHLY`
- `STRIPE_PRICE_PREMIUM_YEARLY`

Environment (Web):

- `NEXT_PUBLIC_FEATURE_PAYMENTS=true`

Flow:

- Web posts to `POST /api/checkout` (Next.js route) which proxies to API `POST /billing/checkout`.
- API creates a Stripe Checkout Session and returns the `url` for redirect.
- Webhook `POST /billing/webhook` verifies signature and, on `checkout.session.completed`, flips the user’s
  `subscriptionStatus` to `active`.

Local webhook test:

```
stripe listen --forward-to http://localhost:3001/billing/webhook
```

Note: success/cancel URLs default to `<ALLOWED_ORIGINS>/billing/return` with status query; you can pass explicit URLs in
the checkout request body if needed.

---

## Social — Follow/followers (MVP)

Schema:

- `Follow (id, followerId, followeeId, createdAt)` with unique `(followerId, followeeId)`.

API endpoints (guarded):

- `POST /social/follow` body `{ userId }` → toggles follow/unfollow, returns `{ following: boolean }`
- `GET /social/followers?userId=` → list of followers (defaults to current user)
- `GET /social/following?userId=` → list of accounts you follow (defaults to current user)

Web pages:

- `(main)/social/followers` — your followers
- `(main)/social/following` — who you follow

---

## Environment validation with Zod

- API: `src/config/env.ts` validates required env (e.g., `API_JWT_SECRET`, Stripe keys) with Zod; boot fails with a
  clear message if invalid.
- Web: `src/lib/env.ts` validates core env (`NEXTAUTH_*`, `API_URL`, `API_JWT_SECRET`, public flags) at first use.
