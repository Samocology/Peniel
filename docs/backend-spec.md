# Peniel backend implementation status

## Architecture

| Layer             | Technology                                                       |
| ----------------- | ---------------------------------------------------------------- |
| Frontend          | React + TypeScript + TanStack Start (Cloudflare Workers SSR)     |
| Backend API       | Cloudflare Workers Free — `src/server.ts` entry point            |
| Authentication    | Supabase Auth (email/password, HttpOnly cookies)                 |
| Database          | Supabase PostgreSQL Free (PostgREST REST API)                    |
| Database security | PostgreSQL RLS + security-definer RPCs                           |
| File storage      | Cloudflare R2 (presigned PUT URLs, never exposes credentials)    |
| Payment provider  | Flutterwave ONLY — no Paystack anywhere                          |
| WhatsApp          | Official WhatsApp Business Cloud API (disabled by default)       |
| Background jobs   | Cloudflare Queues — not yet wired (async notifications deferred) |

---

## Implementation status

| Area                                                              | Status                                                        |
| ----------------------------------------------------------------- | ------------------------------------------------------------- |
| Cloudflare Worker API entry point (`src/server.ts`)               | ✅ Complete                                                   |
| Supabase email/password signup and login                          | ✅ Complete                                                   |
| HttpOnly cookies, session restoration, token rotation             | ✅ Complete                                                   |
| Password recovery request                                         | ✅ Complete                                                   |
| PostgreSQL schema, RLS, triggers, RPCs                            | ✅ Draft migrations ready — apply to Supabase                 |
| Bookings schema + double-booking RPC                              | ✅ Complete (migration 2)                                     |
| Payouts schema                                                    | ✅ Complete (migration 2)                                     |
| Promotions schema                                                 | ✅ Complete (migration 2)                                     |
| Public vendor/product reads                                       | ✅ Complete                                                   |
| Vendor creation (onboarding)                                      | ✅ Complete                                                   |
| Product creation, update, archive                                 | ✅ Complete                                                   |
| Vendor order management (list, status update)                     | ✅ Complete                                                   |
| Vendor analytics (revenue, orders, commissions)                   | ✅ Complete                                                   |
| Vendor ledger/transactions                                        | ✅ Complete                                                   |
| Vendor storefront configuration                                   | ✅ Complete                                                   |
| Vendor profile update                                             | ✅ Complete                                                   |
| Vendor reviews (list + customer submit)                           | ✅ Complete                                                   |
| Vendor customers list                                             | ✅ Complete                                                   |
| Vendor bookings (list, create, status update, availability)       | ✅ Complete                                                   |
| Vendor payout balance calculation                                 | ✅ Complete                                                   |
| Vendor payout history                                             | ✅ Complete                                                   |
| Vendor payout request                                             | ✅ Complete                                                   |
| Vendor promo code management (list, create, update)               | ✅ Complete                                                   |
| Promo code validation (customer checkout)                         | ✅ Complete                                                   |
| Admin vendor management (list, status)                            | ✅ Complete                                                   |
| Admin customer/order/transaction lists                            | ✅ Complete                                                   |
| Admin verification review (approve/reject)                        | ✅ Complete                                                   |
| Admin review moderation                                           | ✅ Complete                                                   |
| Admin disputes management                                         | ✅ Complete                                                   |
| Admin promotions list                                             | ✅ Complete                                                   |
| Admin payouts management                                          | ✅ Complete                                                   |
| Admin platform analytics                                          | ✅ Complete                                                   |
| Admin platform settings                                           | ✅ Complete                                                   |
| Admin audit logging                                               | ✅ Complete                                                   |
| Messaging/chat (persistent, chat-guard applied)                   | ✅ Complete                                                   |
| R2 presigned upload URLs (public + private buckets)               | ✅ Complete                                                   |
| Flutterwave payment initialization                                | ✅ Complete                                                   |
| Flutterwave payment verification (return redirect)                | ✅ Complete                                                   |
| Flutterwave webhook (signature check, idempotency)                | ✅ Complete                                                   |
| Multi-vendor checkout with suborders (DB RPC)                     | ✅ Complete                                                   |
| Inventory reservation (atomic, oversell prevention)               | ✅ Complete                                                   |
| Commission calculation and ledger (DB RPC)                        | ✅ Complete                                                   |
| PDF receipt generation (minimal PDF, no paid service)             | ✅ Complete                                                   |
| In-app notifications API (list, mark read, mark all read)         | ✅ Complete                                                   |
| WhatsApp order notification (disabled/test/production)            | ✅ Complete                                                   |
| WhatsApp payment confirmation                                     | ✅ Complete                                                   |
| WhatsApp webhook challenge verification                           | ✅ Complete                                                   |
| Centralized error types (`src/backend/errors.ts`)                 | ✅ Complete                                                   |
| Shared validation helpers (`src/backend/validation.ts`)           | ✅ Complete                                                   |
| Frontend auth (signup, login, logout, session restore)            | ✅ Wired                                                      |
| Frontend checkout → Flutterwave redirect                          | ✅ Wired                                                      |
| Frontend payment return → server verification                     | ✅ Wired                                                      |
| Frontend vendor onboarding → POST /api/vendors                    | ✅ Wired                                                      |
| Frontend marketplace → fetchBackendVendors (live + seed fallback) | ✅ Wired                                                      |
| Frontend vendor dashboard (orders, analytics, etc.)               | ⚠️ Partial — uses demo fixtures; API exists but not connected |
| Cloudflare Queues for async WhatsApp delivery                     | ❌ Not implemented                                            |
| Frontend dashboard full API integration                           | ❌ Not implemented                                            |
| End-to-end staging test with real Flutterwave credentials         | ❌ Pending credentials                                        |

---

## API endpoints

All responses: `{ ok: boolean, data?: ..., error?: string }`. Same-origin mutations only.

### Authentication

| Method | Path                     | Access              |
| ------ | ------------------------ | ------------------- |
| GET    | /api/health              | Public              |
| POST   | /api/auth/signup         | Public, same-origin |
| POST   | /api/auth/login          | Public, same-origin |
| GET    | /api/auth/session        | Public              |
| POST   | /api/auth/logout         | Same-origin         |
| POST   | /api/auth/password/reset | Public, same-origin |

### Commerce

| Method | Path                      | Access                          |
| ------ | ------------------------- | ------------------------------- |
| GET    | /api/vendors              | Public                          |
| POST   | /api/vendors              | Authenticated                   |
| GET    | /api/vendors/mine         | Authenticated                   |
| GET    | /api/products?vendor_id=  | Public/authenticated            |
| POST   | /api/products             | Authenticated vendor            |
| POST   | /api/checkout             | Authenticated customer          |
| GET    | /api/orders               | Authenticated customer          |
| POST   | /api/payments/verify      | Authenticated customer          |
| POST   | /api/webhooks/flutterwave | Provider signature (verif-hash) |

### Vendor dashboard

| Method | Path                                      | Access                              |
| ------ | ----------------------------------------- | ----------------------------------- |
| GET    | /api/vendor/orders?vendor_id=             | Authenticated vendor                |
| PATCH  | /api/vendor/orders/:id/status             | Authenticated vendor                |
| PATCH  | /api/vendor/products/:id                  | Authenticated vendor                |
| DELETE | /api/vendor/products/:id                  | Authenticated vendor (soft archive) |
| GET    | /api/vendor/analytics?vendor_id=          | Authenticated vendor                |
| GET    | /api/vendor/ledger?vendor_id=             | Authenticated vendor                |
| PATCH  | /api/vendor/storefront?vendor_id=         | Authenticated vendor                |
| PATCH  | /api/vendor/profile?vendor_id=            | Authenticated vendor                |
| GET    | /api/vendor/reviews?vendor_id=            | Authenticated vendor                |
| POST   | /api/vendor/reviews                       | Authenticated customer              |
| GET    | /api/vendor/customers?vendor_id=          | Authenticated vendor                |
| GET    | /api/vendor/bookings?vendor_id=           | Authenticated vendor                |
| GET    | /api/vendor/availability?vendor_id=&date= | Authenticated                       |
| GET    | /api/vendor/payouts/balance?vendor_id=    | Authenticated vendor                |
| GET    | /api/vendor/payouts?vendor_id=            | Authenticated vendor                |
| POST   | /api/vendor/payouts                       | Authenticated vendor                |
| GET    | /api/vendor/promos?vendor_id=             | Authenticated vendor                |
| POST   | /api/vendor/promos                        | Authenticated vendor                |
| PATCH  | /api/vendor/promos/:id                    | Authenticated vendor                |

### Bookings

| Method | Path                     | Access                             |
| ------ | ------------------------ | ---------------------------------- |
| POST   | /api/bookings            | Authenticated customer             |
| GET    | /api/bookings            | Authenticated customer             |
| PATCH  | /api/bookings/:id/status | Authenticated (vendor or customer) |

### Promos

| Method | Path                 | Access        |
| ------ | -------------------- | ------------- |
| POST   | /api/promos/validate | Authenticated |

### Notifications

| Method | Path                        | Access        |
| ------ | --------------------------- | ------------- |
| GET    | /api/notifications          | Authenticated |
| PATCH  | /api/notifications/:id/read | Authenticated |
| PATCH  | /api/notifications/read-all | Authenticated |

### Receipts

| Method | Path                          | Access                 |
| ------ | ----------------------------- | ---------------------- |
| GET    | /api/receipts/:orderReference | Authenticated customer |

### Admin

| Method | Path                          | Access |
| ------ | ----------------------------- | ------ |
| GET    | /api/admin/vendors            | Admin  |
| PATCH  | /api/admin/vendors/:id/status | Admin  |
| GET    | /api/admin/customers          | Admin  |
| GET    | /api/admin/orders             | Admin  |
| GET    | /api/admin/transactions       | Admin  |
| GET    | /api/admin/verification       | Admin  |
| PATCH  | /api/admin/verification/:id   | Admin  |
| GET    | /api/admin/reviews            | Admin  |
| PATCH  | /api/admin/reviews/:id        | Admin  |
| GET    | /api/admin/categories         | Admin  |
| GET    | /api/admin/analytics          | Admin  |
| GET    | /api/admin/settings           | Admin  |
| PATCH  | /api/admin/settings/:key      | Admin  |
| GET    | /api/admin/disputes           | Admin  |
| PATCH  | /api/admin/disputes/:id       | Admin  |
| GET    | /api/admin/promotions         | Admin  |
| GET    | /api/admin/payouts            | Admin  |
| PATCH  | /api/admin/payouts/:id        | Admin  |

### Messaging

| Method | Path                                     | Access                 |
| ------ | ---------------------------------------- | ---------------------- |
| GET    | /api/messages/conversations              | Authenticated          |
| POST   | /api/messages/conversations              | Authenticated customer |
| GET    | /api/messages/conversations/:id/messages | Authenticated member   |
| POST   | /api/messages/conversations/:id/messages | Authenticated member   |
| PATCH  | /api/messages/conversations/:id/read     | Authenticated member   |

### Storage

| Method | Path                    | Access        |
| ------ | ----------------------- | ------------- |
| POST   | /api/storage/upload-url | Authenticated |

### WhatsApp

| Method | Path                   | Access             |
| ------ | ---------------------- | ------------------ |
| GET    | /api/webhooks/whatsapp | Provider challenge |

---

## Required Worker bindings

Configure via `wrangler secret put <NAME>` for deployed Workers.
For local development copy `.env.example` to `.dev.vars` (never commit that file).

| Name                            | Type   | Required       | Notes                                        |
| ------------------------------- | ------ | -------------- | -------------------------------------------- |
| SUPABASE_URL                    | var    | Yes            | Supabase project endpoint                    |
| SUPABASE_ANON_KEY               | var    | Yes            | Publishable key only                         |
| SUPABASE_SERVICE_ROLE_KEY       | secret | Yes (webhook)  | Webhook RPC only; never expose to browser    |
| APP_BASE_URL                    | var    | Yes            | Canonical app URL for Flutterwave redirect   |
| FLUTTERWAVE_SECRET_KEY          | secret | Yes (payments) | Payment init and verification                |
| FLUTTERWAVE_WEBHOOK_SECRET_HASH | secret | Yes (webhook)  | Webhook signature verification               |
| R2_ACCOUNT_ID                   | secret | R2 only        | R2 presigned URL generation                  |
| R2_BUCKET_PUBLIC                | var    | R2 only        | Public media bucket name                     |
| R2_BUCKET_PRIVATE               | var    | R2 only        | Private documents bucket name                |
| R2_ACCESS_KEY_ID                | secret | R2 only        | R2 API credentials                           |
| R2_SECRET_ACCESS_KEY            | secret | R2 only        | R2 API credentials                           |
| R2_PUBLIC_MEDIA_URL             | var    | R2 only        | Public CDN or r2.dev URL                     |
| WHATSAPP_MODE                   | var    | No             | disabled/test/production (default: disabled) |
| WHATSAPP_ACCESS_TOKEN           | secret | Production WA  | Meta Graph API token                         |
| WHATSAPP_PHONE_NUMBER_ID        | secret | Production WA  | WhatsApp phone number ID                     |
| WHATSAPP_BUSINESS_ACCOUNT_ID    | var    | Production WA  | WABA ID                                      |
| WHATSAPP_WEBHOOK_VERIFY_TOKEN   | secret | Production WA  | Webhook challenge token                      |
| WHATSAPP_APP_SECRET             | secret | Production WA  | App secret for webhook verification          |

---

## Setup instructions

### 1. Supabase

1. Create a free project at https://supabase.com/
2. In the SQL editor, run `supabase/migrations/20261108180000_peniel_core.sql`
3. Then run `supabase/migrations/20261108180001_peniel_bookings_payouts_promos.sql`
4. Set Auth email confirmation redirect URL to your app origin
5. Provision the first admin via a controlled server-side process only:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';
   ```
   Never use `signup_intent` metadata as an admin role source.
6. Keep the Supabase project active — free projects pause after 1 week of inactivity.
   Use the Supabase dashboard or a scheduled ping to prevent pausing.

### 2. Cloudflare Workers

```bash
cp .env.example .dev.vars   # edit with real values, never commit
npm run dev

# Deploy
npm run build && wrangler deploy

# Set secrets (one per command)
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put FLUTTERWAVE_SECRET_KEY
wrangler secret put FLUTTERWAVE_WEBHOOK_SECRET_HASH
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
```

### 3. Flutterwave webhooks

1. Flutterwave dashboard → Settings → Webhooks
2. Webhook URL: `https://your-domain.com/api/webhooks/flutterwave`
3. Copy Secret Hash → set as `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
4. Redirect URL (in payment init): `https://your-domain.com/payment`

### 4. WhatsApp (disabled by default — zero cost until enabled)

1. Create Meta Business account and WhatsApp Business app
2. Set webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
3. Set `WHATSAPP_MODE=test` to verify integration without real messages
4. Only set `WHATSAPP_MODE=production` after approved templates and explicit sign-off
5. The rest of Peniel continues operating if WhatsApp is disabled or fails

### 5. R2 storage

1. Create two R2 buckets: `peniel-media-public` and `peniel-media-private`
2. Enable public access on the public bucket (or configure a custom domain)
3. Create an R2 API token with Object Read & Write permissions
4. Set all `R2_*` environment variables

---

## Free-tier resource limits

| Service            | Free allowance                                       | Notes                                  |
| ------------------ | ---------------------------------------------------- | -------------------------------------- |
| Supabase           | 500 MB DB, 2 GB egress/month, 50K MAU                | Project pauses after 1 week inactivity |
| Cloudflare Workers | 100K requests/day, 10ms CPU/request                  | No automatic upgrade                   |
| Cloudflare R2      | 10 GB storage, 1M Class-A ops, 10M Class-B ops/month | No egress fees                         |
| Flutterwave        | Per-transaction fees only                            | No subscription required               |
| WhatsApp           | Per-message fees in production                       | Disabled by default — zero cost        |

---

## Test results

Run: `npm run test:backend`

```
✔ login proxies credentials and keeps Supabase tokens in HttpOnly cookies
✔ cross-origin authentication mutations are rejected before contacting Supabase
✔ invalid registration input is rejected without sending credentials upstream
✔ signup role input is stored only as non-privileged intent metadata
✔ session endpoint validates the cookie with Supabase rather than trusting its contents
✔ session endpoint rotates cookies after an expired access token
✔ logout revokes the Supabase session and clears both cookies
✔ cross-origin commerce mutations are rejected before identity or database requests
✔ invalid product cookies cannot fall through to public anonymous catalog access
✔ checkout refuses to create an order before payment configuration exists
✔ JSON reader accepts object bodies and rejects invalid or oversized bodies
✔ mutation origin check permits only the request's own origin
✔ JSON responses are explicitly non-cacheable
✔ vendor orders endpoint requires authentication
✔ vendor orders endpoint rejects invalid vendor_id
✔ vendor analytics returns aggregated data from ledger and orders
✔ vendor order status update rejects invalid status values
✔ vendor order status update accepts valid status
✔ cross-origin vendor mutations are rejected
✔ admin endpoints reject non-admin users
✔ admin vendor list returns data for admin users
✔ admin vendor status update requires valid status
✔ admin verification review rejects invalid decision
✔ messaging requires authentication
✔ send message applies chat guard and blocks contact info
✔ send message blocks empty body
✔ storage upload URL requires R2 configuration
✔ storage upload URL rejects disallowed content types
✔ storage upload URL rejects invalid purpose
✔ WhatsApp order notification is skipped when mode is disabled
✔ WhatsApp order notification logs in test mode without calling API
✔ WhatsApp failure does not throw - returns failed log entry
✔ WhatsApp payment confirmation is skipped when disabled
✔ WhatsApp webhook challenge verification succeeds with correct token
✔ WhatsApp webhook challenge verification fails with wrong token

tests 35 | pass 35 | fail 0
```

---

## Security notes

- Session tokens are in HttpOnly, SameSite=Lax cookies. Never returned in JSON.
- All mutating routes enforce same-origin Origin header check.
- `signup_intent` is user metadata only — never used for authorization.
- Admin role is verified server-side via `rpc/is_admin` on every admin request.
- Vendor ownership is enforced by RLS (`is_vendor_member`) — not by frontend claims.
- Payment amounts are always calculated server-side from database prices.
- Payment success is only recorded after independent Flutterwave verification.
- Webhook idempotency (`payment_webhook_events` unique constraint) prevents duplicate ledger entries.
- WhatsApp failures are isolated — they never affect order or payment state.
- R2 credentials are never exposed to the browser (presigned URLs only).
- Verification documents use a separate private bucket.
- All admin actions write to `admin_audit_logs`.
- `confirm_flutterwave_payment` RPC is restricted to `service_role` only.
- Vendor status and owner changes are blocked by DB triggers for non-admins.

---

## Outstanding work

1. **Apply SQL migrations** to a live Supabase project and validate all RPCs
2. **Connect vendor dashboard frontend** to real API (replace demo fixtures in `peniel-store.ts`)
3. **Cloudflare Queues** for async WhatsApp delivery with retry
4. **End-to-end staging test** with real Flutterwave test credentials
5. **Admin role provisioning** — document the controlled SQL process
6. **Supabase keep-alive** — schedule a ping to prevent free-tier project pausing
7. **Image upload flow** — wire the R2 presigned URL into the onboarding branding step
8. **Vendor dashboard full integration** — replace `useCurrentVendor()` / `useApp()` demo data with live API calls in all vendor routes

---

## Feature completion table

| Feature                                                         | Status                              |
| --------------------------------------------------------------- | ----------------------------------- |
| Authentication (signup, login, logout, session, password reset) | ✅ Complete                         |
| Vendor onboarding (POST /api/vendors)                           | ✅ Complete                         |
| Storefront management                                           | ✅ Complete                         |
| Product management (create, update, archive, publish)           | ✅ Complete                         |
| Public marketplace (vendor + product discovery)                 | ✅ Complete                         |
| Cart (local state, productId-aware)                             | ✅ Complete                         |
| Checkout → Flutterwave redirect                                 | ✅ Complete                         |
| Payment return verification                                     | ✅ Complete                         |
| Flutterwave webhook (idempotent, signature-verified)            | ✅ Complete                         |
| Multi-vendor orders + suborders                                 | ✅ Complete (DB RPC)                |
| Inventory reservation (atomic)                                  | ✅ Complete (DB RPC)                |
| Commission calculation + ledger                                 | ✅ Complete (DB RPC)                |
| PDF receipt generation                                          | ✅ Complete                         |
| Vendor order management                                         | ✅ Complete                         |
| Vendor analytics                                                | ✅ Complete                         |
| Vendor ledger/transactions                                      | ✅ Complete                         |
| Vendor payout request + balance                                 | ✅ Complete                         |
| Vendor promo codes                                              | ✅ Complete                         |
| Promo code validation                                           | ✅ Complete                         |
| Bookings (create, list, status, availability)                   | ✅ Complete                         |
| Messaging/chat (persistent, chat-guard)                         | ✅ Complete                         |
| In-app notifications                                            | ✅ Complete                         |
| R2 presigned upload URLs                                        | ✅ Complete                         |
| WhatsApp notifications (disabled/test/production)               | ✅ Complete                         |
| Admin dashboard (all sections)                                  | ✅ Complete                         |
| Admin audit logging                                             | ✅ Complete                         |
| Reviews (submit + moderation)                                   | ✅ Complete                         |
| Centralized error handling                                      | ✅ Complete                         |
| Input validation helpers                                        | ✅ Complete                         |
| RLS policies                                                    | ✅ Complete (in migrations)         |
| Security triggers (role/owner protection)                       | ✅ Complete (in migrations)         |
| Frontend auth wired                                             | ✅ Complete                         |
| Frontend checkout wired                                         | ✅ Complete                         |
| Frontend payment return wired                                   | ✅ Complete                         |
| Frontend onboarding wired                                       | ✅ Complete                         |
| Frontend marketplace wired (live + seed fallback)               | ✅ Complete                         |
| Frontend vendor dashboard wired to live API                     | ❌ Not yet — uses demo fixtures     |
| Cloudflare Queues async processing                              | ❌ Not yet                          |
| Image upload in onboarding branding step                        | ❌ Not yet                          |
| End-to-end staging test                                         | ❌ Blocked — needs real credentials |
