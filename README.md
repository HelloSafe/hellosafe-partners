# HelloSafe Partners

Full-stack affiliate program for [HelloSafe.com](https://hellosafe.com) travel
insurance: marketing site, partner signup with admin validation, tracked deep
links with click logging, conversion postback from HelloSafe, and a real
reporting dashboard.

Built with **Next.js 16** (App Router), **React 19**, **Drizzle + Postgres
(Neon)**, **next-intl** (FR + EN), **Tailwind v4**, and **Better Auth** for
email + password and Google OAuth.

## Prerequisites

- Node.js 22+
- A Postgres database (we use [Neon](https://neon.tech) — free tier is fine)
- *(optional)* Google Cloud OAuth 2.0 Client ID (Web) for "Sign in with Google"

## 1. Setup

```bash
npm install
cp .env.example .env.local
# Fill in the values (see section "Environment variables" below)
```

## 2. Environment variables

| Var | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string (Neon pooled URL recommended) |
| `BETTER_AUTH_SECRET` | ✅ | Random 32+ chars. `openssl rand -base64 48`. Falls back to `SESSION_SECRET` for backward compat. |
| `POSTBACK_SECRET` | ✅ | Bearer token HelloSafe uses to hit `/api/postback/conversion` |
| `IP_HASH_SALT` | ✅ | Random string — we never store raw visitor IPs |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL of the app, e.g. `http://localhost:3000` or `https://partners.hellosafe.com` |
| `GOOGLE_CLIENT_ID` | ⬜ | Google OAuth Web Client ID. Optional — Better Auth's social signin only enables when both Google vars are set. |
| `GOOGLE_CLIENT_SECRET` | ⬜ | Google OAuth client secret |
| `SENTRY_DSN` | ⬜ | Server-side Sentry DSN. Optional — Sentry runs as a no-op when unset. |
| `NEXT_PUBLIC_SENTRY_DSN` | ⬜ | Client-side Sentry DSN |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | ⬜ | Required only for sourcemap upload at build time |

For Google OAuth, your authorized redirect URI must be
`${NEXT_PUBLIC_APP_URL}/api/auth/callback/google` (Better Auth convention).

## 3. Create the schema and seed demo data

```bash
npm run db:push     # creates all tables on Neon
npm run db:seed     # seeds admin + demo approved partner + 5 links + historical conversions
```

Seed credentials:

| Role | Email | Password | Entry point |
|---|---|---|---|
| **Demo (persistent, 1y session)** | `antoine@hellosafe.fr` | `demo1234` | `/fr/admin` |
| Admin | `admin@hellosafe.test` | `changeme` | `/fr/admin` |
| Blog partner | `demo@partner.fr` | `partner123` | `/fr/dashboard` |
| Agency partner | `agency@hellosafe.test` | `agency123` | `/fr/dashboard/coach` |

## 4. Run

```bash
npm run dev
# open http://localhost:3000
```

## Architecture

```
Browser (partner)  ─► Next.js App (pages + API routes)  ─► Neon Postgres
                       │
Reader of partner  ─► /r/{shortCode}  ─► 302 to hellosafe.com/{lang}/...
                       │                 preserving ?ref=hs-xxx-xxx&utm_*&subid=
                       ▼
                     clicks table          ◄──── postback ───  HelloSafe
                     conversions table                       (Bearer POSTBACK_SECRET)
```

### Tables (Drizzle `src/db/schema.ts`)
- `users` — email/password + optional Google link, role (partner | admin)
- `partners` — one per user, status (pending | approved | rejected), `partnerCode`
- `tracked_links` — one `shortCode` per link, owns destination + sub-id + campaign
- `clicks` — hashed IP, UA, referer, country (no PII)
- `conversions` — upserted by `externalOrderId`, status (pending | validated | cancelled)
- `payouts` — reserved for future cron (dashboard currently aggregates from `conversions`)
- `sessions` — HttpOnly cookie-backed, 30-day TTL
- `oauth_states` — short-lived CSRF + PKCE verifier for Google flow

### Routes
| Path | Purpose |
|---|---|
| `/{locale}` | Marketing landing |
| `/{locale}/why-partner` | Benefits + comparison table |
| `/{locale}/how-it-works` | 3-step onboarding + creative kit |
| `/{locale}/faq` | 10 FAQ items |
| `/{locale}/signup` | Create account (→ `pending` partner) |
| `/{locale}/login` | Email+password or Google |
| `/{locale}/dashboard` | Real KPIs, 30-day graph, top links |
| `/{locale}/dashboard/links` | Link generator + table |
| `/{locale}/dashboard/payouts` | Payouts aggregated from conversions |
| `/{locale}/admin` | Admin back-office (partners to approve + live conversions + test-conversion button) |
| `/r/{shortCode}` | Tracked-link redirect. Logs click, 302s to hellosafe.com |
| `/api/auth/{signup, login, logout, me}` | Credential auth |
| `/api/auth/google` + `/api/auth/google/callback` | Google OAuth 2.0 (PKCE) |
| `/api/links` | GET list / POST create |
| `/api/dashboard/{overview, payouts}` | Aggregated reporting |
| `/api/postback/conversion` | ⚡ What HelloSafe calls to record sales |
| `/api/admin/{partners, partners/[id], conversions, test-conversion}` | Admin APIs |

## Testing the full flow (with curl)

```bash
# 1. Log in as demo partner
curl -c /tmp/jar -X POST http://localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"demo@partner.fr","password":"partner123"}'

# 2. Create a tracked link
curl -b /tmp/jar -X POST http://localhost:3000/api/links \
  -H 'content-type: application/json' \
  -d '{"label":"Article PVT 2026","destination":"pvt","language":"fr","campaign":"pvt-may","subId":"article-123"}'

# 3. Simulate a visitor click (note: we get a 302 to hellosafe.com)
SHORT="paste-shortCode-here"
curl -i "http://localhost:3000/r/$SHORT?subid=creative-A"

# 4. Simulate HelloSafe pushing a conversion (server-to-server postback)
REF="hs-v9bavm-$SHORT"   # partnerCode-shortCode
BEARER="$(grep POSTBACK_SECRET .env.local | cut -d= -f2-)"
curl -X POST http://localhost:3000/api/postback/conversion \
  -H 'content-type: application/json' \
  -H "authorization: Bearer $BEARER" \
  -d "{\"ref\":\"$REF\",\"externalOrderId\":\"HS-ORDER-12345\",\"amount\":89,\"commission\":13.35,\"status\":\"validated\"}"

# 5. Refresh the partner dashboard
curl -b /tmp/jar http://localhost:3000/api/dashboard/overview | jq
```

Admin alternative: log in as `admin@hellosafe.test`, go to `/fr/admin` → tab
*Conversions* → "Simuler une conversion" form.

## Postback contract (HelloSafe → Partners)

`POST /api/postback/conversion`

Header:
```
Authorization: Bearer {POSTBACK_SECRET}
Content-Type: application/json
```

Body:
```json
{
  "ref": "hs-v9bavm-abc12345",
  "externalOrderId": "HS-ORDER-2026-04-00123",
  "amount": 89.00,
  "commission": 13.35,
  "currency": "EUR",
  "status": "pending | validated | cancelled",
  "subId": "optional-sub-id"
}
```

- `ref` must match a tracked link owned by the partner (format
  `partnerCode-shortCode`). Both are part of the URL query the partner pastes
  in their content.
- Idempotent: re-posting with the same `externalOrderId` updates the existing
  conversion (used to flip `pending` → `validated` after the 14-day cooling-off
  period, or `cancelled` on refund).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate SQL migrations from schema.ts |
| `npm run db:push` | Push schema to DB (dev) |
| `npm run db:studio` | Launch Drizzle Studio (visual DB browser) |
| `npm run db:seed` | Seed admin + demo data |

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add the same env vars from `.env.example` in Vercel Project Settings →
   Environment Variables. Use fresh values for `SESSION_SECRET`,
   `POSTBACK_SECRET`, `IP_HASH_SALT` in production. Point `NEXT_PUBLIC_APP_URL`
   to your production URL.
3. In the Google Cloud Console, add your production URL to *Authorized
   JavaScript origins* and `${prod}/api/auth/google/callback` to *Authorized
   redirect URIs*.
4. After first deploy, run `npm run db:seed` once with your production
   `DATABASE_URL` (locally, with the prod value temporarily) to create the
   admin user — or sign up normally and approve yourself with another admin
   account.
