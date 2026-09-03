# Developer Guide — Glamorous Thread

Everything a developer needs to set up, run, and extend this project.

**If you are setting this up for the first time**, start with [Environment variables](#environment-variables--full-setup) — it walks through every account you need to create and every key you need to obtain, step by step.

Read the [README](../README.md) for a feature overview, and the [User Guide](USER-GUIDE.md) for how the store is operated day to day.

---

## Contents

1. [Local setup](#local-setup)
2. [**Environment variables — full setup**](#environment-variables--full-setup) ← start here
3. [Going live](#going-live)
4. [Architecture](#architecture)
5. [Conventions](#conventions)
6. [Authentication internals](#authentication-internals)
7. [Concurrency-safe patterns](#concurrency-safe-patterns)
8. [Working with the database](#working-with-the-database)
9. [Common tasks](#common-tasks)
10. [Gotchas](#gotchas)
11. [Testing & verification](#testing--verification)

---

## Local setup

```bash
npm install
cp .env.example .env
npx prisma generate && npx prisma db push
npm run seed -- 9876543210
npm run dev
```

Only `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `JWT_SECRET` are strictly required to start. Without an OTP provider configured, login still works in development — the code is printed to the server log.

**Don't have those values yet?** The next section walks through creating each account and obtaining every key.

> **Next.js 16 note:** this version renames Middleware to **Proxy** (`proxy.ts`), and `params` / `searchParams` are Promises that must be awaited. The bundled docs in `node_modules/next/dist/docs/` are the source of truth — the API differs from older App Router material.

## Environment variables — full setup

Everything the application needs is configured through a single `.env` file in the project root. Copy the template and fill it in:

```bash
cp .env.example .env
```

**Never commit `.env`.** It is already listed in `.gitignore`. Share values with your team through a password manager, not email or chat.

### What you need, at a glance

| Service | Purpose | Required? | Free tier |
|---|---|---|---|
| **Neon** | PostgreSQL database | ✅ Yes — nothing runs without it | Yes |
| **JWT secret** | Signs login sessions, hashes OTPs | ✅ Yes — you generate it yourself | n/a |
| **MiniMoth** | Sends login OTPs (WhatsApp → SMS) | ⚠️ Needed for real logins | Test keys available |
| **Cloudinary** | Product image hosting & uploads | ⚠️ Needed to upload product images | Yes |
| **Meta WhatsApp** | Order & payment messages to customers | ⚪ Optional — orders still work without it | Yes, with limits |
| **Store number** | Your business WhatsApp number | ⚪ Recommended | n/a |

You can get the site **running locally** with just the first two. The rest switch on features as you add them.

---

### 1. Database — Neon (required)

Provides the PostgreSQL database. Everything — products, orders, customers — lives here.

**Getting the values**

1. Sign up at **[neon.tech](https://neon.tech)** and create a project (pick the region closest to your customers, e.g. Singapore or Mumbai for India)
2. On the project dashboard, open **Connection Details**
3. Copy the **Pooled connection** string → `DATABASE_URL`
4. Switch the toggle to **Direct connection** and copy that string → `DATABASE_URL_UNPOOLED`

```env
DATABASE_URL=postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

Both are needed: the app uses the pooled one at runtime, and Prisma uses the direct one to apply schema changes. Note the pooled hostname contains `-pooler`.

> **If this is wrong:** the site fails to load with a database connection error. Neon's free tier also suspends after inactivity — the first request afterwards can take a few seconds while it wakes.

---

### 2. Session secret — JWT_SECRET (required)

A random string that signs login sessions and hashes one-time passcodes. You generate this yourself; it is not obtained from any service.

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

```env
JWT_SECRET=paste-the-generated-string-here
OTP_EXPIRY_MINUTES=5
```

Must be at least 32 characters. Use a **different value in production** than in development.

> ⚠️ **Changing this logs everyone out** and invalidates any OTP that hasn't been used yet. Set it once and leave it alone.

`OTP_EXPIRY_MINUTES` is optional and defaults to 5.

---

### 3. Login OTPs — MiniMoth (needed for real logins)

Delivers the 6-digit login codes. It tries WhatsApp first and falls back to SMS automatically — which matters in India, where many providers cannot deliver SMS reliably.

**Getting the values**

1. Sign up at **[app.minimoth.dev](https://app.minimoth.dev)**
2. Create a project and copy its API key (it looks like `mm_live_…` or `mm_test_…`)

```env
MINIMOTH_API_KEY=mm_live_xxxxxxxxxxxx
MINIMOTH_BASE_URL=https://api.minimoth.dev/v1
```

Leave `MINIMOTH_BASE_URL` exactly as shown.

**Their limits:** codes last 10 minutes; a live key allows 3 sends per phone number per 10 minutes and 5 verification attempts per code. A test key is far more permissive — use one while developing so you don't burn quota.

> **If this is blank:** the app falls back to sending OTPs through your own WhatsApp Cloud API (section 5). If neither is configured, **login still works in development** — the code is printed to the terminal running `npm run dev`. In production it returns an error instead, so one of the two must be set before launch.

---

### 4. Image uploads — Cloudinary (needed for product images)

Hosts product photos. Uploads go straight from the admin's browser to Cloudinary, so images never pass through your server.

**Getting the values**

1. Sign up at **[cloudinary.com](https://cloudinary.com)**
2. Your **Cloud name** is on the dashboard → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
3. Copy the **API Environment variable** (`cloudinary://…`) → `CLOUDINARY_URL`
4. Create an **unsigned upload preset**, which allows browser uploads:
   - **Settings** (gear icon) → **Upload** → **Upload presets** → **Add upload preset**
   - Set **Signing Mode** to **Unsigned**
   - Save, then copy the preset name → `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

```env
CLOUDINARY_URL=cloudinary://123456789:abcdefg@your-cloud-name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset-name
```

The two `NEXT_PUBLIC_` values are visible in the browser by design — that is how unsigned uploads work, and it is safe. The preset must be **Unsigned** or uploads will be rejected.

> **If this is missing:** the admin panel loads, but choosing an image in the product form fails. Everything else is unaffected.

---

### 5. Customer messages — Meta WhatsApp Cloud API (optional)

Sends the automated order and payment messages. **Orders still work without this** — the customer's own WhatsApp still opens at checkout, and admins can still confirm and mark orders paid. Only the automated messages are skipped, and each failure is recorded on the order so nothing is lost silently.

**Getting the values**

1. Go to **[developers.facebook.com](https://developers.facebook.com)** → **My Apps** → **Create App** → type **Business**
2. Add the **WhatsApp** product to the app
3. From **WhatsApp → API Setup**, copy:
   - **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - **WhatsApp Business Account ID** → `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - An access token → `WHATSAPP_ACCESS_TOKEN`

> The token shown on the API Setup page is temporary (24 hours). For production, create a **System User** in Business Settings and generate a **permanent** token, or messages will silently stop working after a day.

```env
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_API_VERSION=v21.0
```

**Message templates.** Meta requires pre-approved templates for business-initiated messages. Create these under **WhatsApp Manager → Message Templates**, then put their names in `.env`:

| Variable | Template category | Variables it receives |
|---|---|---|
| `WHATSAPP_PAYMENT_TEMPLATE_NAME` | Utility | customer name, order number, total |
| `WHATSAPP_PAYMENT_SUCCESS_TEMPLATE_NAME` | Utility | customer name, order number, total |
| `WHATSAPP_OTP_TEMPLATE_NAME` | **Authentication** | the code |

```env
WHATSAPP_PAYMENT_TEMPLATE_NAME=payment_request
WHATSAPP_PAYMENT_SUCCESS_TEMPLATE_NAME=payment_success
WHATSAPP_OTP_TEMPLATE_NAME=login_code
WHATSAPP_OTP_TEMPLATE_HAS_BUTTON=true
```

Two things that catch people out:

- **Put your actual payment instructions (UPI ID, bank details) in the payment template's own text.** The app only supplies the name, order number and amount — there is no payment link to send.
- **`WHATSAPP_OTP_TEMPLATE_HAS_BUTTON` must match your template.** Authentication templates normally include a "Copy code" button, which is the default (`true`). If you created one *without* a button, set this to `false` — Meta rejects any message whose parts don't match the approved template.

---

### 6. Your store's WhatsApp number

The number customers message when they place an order, and the one behind the floating chat button.

```env
WHATSAPP_NUMBER=918104834173
NEXT_PUBLIC_WHATSAPP_NUMBER=918104834173
```

Format: country code + number, **no `+`, spaces or dashes**. Set both to the same value — the first is used on the server, the second in the browser (client-side code can only read variables prefixed with `NEXT_PUBLIC_`).

> ⚠️ If you register this same number as your Meta Cloud API sender, it **cannot receive its own OTPs** — WhatsApp does not allow a business number to message itself. Keep a second admin account on a different number, or use a separate number as the API sender.

---

### Minimum working configuration

To get the site running locally today:

```env
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
JWT_SECRET=<generated>
```

That gives you a working storefront and admin panel, with login codes printed to the terminal. Add MiniMoth for real logins, Cloudinary for image uploads, and Meta for customer messages as you go.

### Verifying your configuration

```bash
npx prisma db push     # succeeds → database credentials are correct
npm run dev            # visit http://localhost:3000
```

Then request a login code at `/auth/login`. Watch the terminal:

- `{"sent":true}` → your OTP provider is working, the code went to the phone
- `{"devFallback":true}` plus `[dev] OTP for +91…: 123456` in the terminal → no provider configured; use the printed code

---

## Going live

A checklist for the first production deployment.

### 1. Host the app

Deploy to **[Vercel](https://vercel.com)** — import the Git repository and it detects Next.js automatically. Any host that can run `next build && next start` works too.

### 2. Add the environment variables

In **Vercel → Project → Settings → Environment Variables**, add every value from your `.env`. Use a **production `JWT_SECRET`** different from your local one.

### 3. Apply the database schema

Against the production database, once:

```bash
npx prisma generate && npx prisma db push
```

### 4. Create the first admin

Nobody can reach `/admin` until an admin exists:

```bash
npm run seed -- 9876543210
```

Use the store owner's real mobile number — that is how they will log in.

### 5. Check before announcing

- [ ] Homepage, a collection page and a product page all load
- [ ] Login works and the code actually arrives on a phone
- [ ] The admin account reaches `/admin/dashboard`
- [ ] A test order places successfully and appears in Orders
- [ ] Confirm Order and Mark as Paid both work on that test order
- [ ] Delete the test order and restore the stock afterwards
- [ ] A product image uploads in the admin panel
- [ ] The contact form creates a lead

### Ongoing

- **Backups:** Neon keeps point-in-time history on paid plans; verify the retention on your tier.
- **WhatsApp token:** if you used a temporary token it expires in 24 hours. Swap it for a permanent System User token.
- **Rotating `JWT_SECRET`** logs every user out. Only do it if you believe it has leaked.

---

---

## Architecture

### Rendering

Pages are **Server Components** by default and query Prisma directly. Client Components are used only where interactivity demands it, and are kept as small leaves.

The recurring shape for admin lists:

```
page.tsx  (Server Component)  → fetches data, maps to plain rows
  └─ XTable.tsx  ('use client') → owns the column definitions, renders AdminDataTable
```

This exists because **Server Components cannot pass functions to Client Components**, and TanStack Table's `ColumnDef.cell` is a function. Building columns inside the client wrapper avoids the serialization error.

### Layers

```
app/api/**/route.ts   HTTP: parse → Zod validate → call lib → ok()/err()
lib/                  Business logic, reusable and framework-free where possible
lib/prisma.ts         The single shared Prisma client — always import this
```

Keep business rules in `lib/`. Route handlers should stay thin.

### Route protection

Two layers, deliberately:

1. **`proxy.ts`** — an *optimistic* check. Verifies the session cookie and redirects signed-out visitors away from `/account`, `/user-profile`, `/checkout`, `/orders`, `/admin`. Next's own docs warn that Proxy should not be your only authorization layer.
2. **The page or route itself** — the real check. `app/admin/layout.tsx` re-reads `isAdmin` from the database; every admin API route calls `ensureAdmin()`.

`proxy.ts` matchers are **explicit paths**, not a catch-all regex. It also must not import Prisma or `next/headers` — see [Gotchas](#gotchas).

---

## Conventions

### API responses

Always use the helpers from `lib/validations`:

```ts
return ok(data)            // { success: true, data }
return ok(data, 201)
return err('Message', 400) // { success: false, error }
return validationErr(parsed.error)  // 422 with per-field messages
```

Clients read `data.data` on success and `data.error` on failure. Don't hand-roll `Response.json`.

### Validation

Every route that accepts a body validates it with Zod. Shared schemas live in `lib/validations/index.ts`; single-use ones are defined in the route file.

### Admin route skeleton

```ts
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params            // Next 16: params is a Promise

  let body: unknown
  try { body = await req.json() } catch { return err('Invalid request body', 400) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  // ... work ...
  await createAuditLog({ action: 'THING_UPDATED', entityType: 'Thing', entityId: id, before, after })
  return ok(result)
}
```

### Audit logging

State-changing admin actions call `createAuditLog()`. Add new action names to the `AuditAction` union in `lib/audit.ts` so they stay greppable.

### Error logging

Tag errors with a stable code so they can be found in logs:

```ts
console.error('ORDER_CREATE_ERROR', error)
```

### Styling

Match what's already there. Dark theme only. Reuse the existing tokens rather than inventing values:

```
bg-brand-bg (#121212)   cards #1A1A1A   borders #2A2A2A   inputs #111111
body text #8A8A8A       accent #D4D4D4
.luxury-button  .premium-card  .section-label  .font-cormorant
```

Form fields copy the pattern in `component/checkout/CheckoutAddress.tsx`. Static pages use `component/common/StaticPage.tsx`.

---

## Authentication internals

| File | Responsibility |
|---|---|
| `lib/auth/jwt.ts` | Sign / verify session tokens (HS256 via `jose`) |
| `lib/auth/session.ts` | Cookie read/write, `getSession()`, `getCurrentUser()` |
| `lib/auth/otp.ts` | Generate, HMAC-hash and compare codes |
| `lib/auth/phone.ts` | E.164 normalisation (no server-only imports — the client uses it too) |
| `lib/auth/constants.ts` | `SESSION_COOKIE` — dependency-free so `proxy.ts` can import it |
| `lib/auth/otp-provider.ts` | Chooses MiniMoth or the self-hosted flow |
| `lib/auth/providers/minimoth.ts` | MiniMoth client |

**Reading the current user:**

```ts
const session = await getSession()          // { userId, phoneNumber, isAdmin } | null
const user = await getCurrentUser()         // full User record | null
```

Prefer `session.userId` when you only need the id — it avoids a query.

**Trust model:** the token's `isAdmin` claim is used only for cheap optimistic checks. Anything that grants access re-reads `isAdmin` from the database.

**MiniMoth API** (verified against the live service — it differs from what's commonly assumed):

```
POST https://api.minimoth.dev/v1/otp/send     { "phone": "+919876543210" }
POST https://api.minimoth.dev/v1/otp/verify   { "phone": "+91…", "code": "123456" }
Header: X-Api-Key: <key>        ← not Authorization: Bearer
```

Routes live under `/v1`, there's no `channel` parameter (WhatsApp-then-SMS is decided server-side), and verify takes `code`, not `otp`. MiniMoth returns its own tokens; we ignore them and mint our own session, which their docs explicitly support.

---

## Concurrency-safe patterns

Two real bugs were fixed here. Follow these patterns when writing similar code.

### Guarded decrement (stock)

Checking a value and then updating it in two steps is a race. Put the condition in the `where` clause so the database enforces it atomically:

```ts
const claimed = await tx.productVariant.updateMany({
  where: { id: variantId, stock: { gte: quantity } },
  data:  { stock: { decrement: quantity } },
})
if (claimed.count === 0) throw new OutOfStockError(variantId)
```

Without the `stock: { gte }` guard, two concurrent orders for the last unit both succeed and stock goes negative. The same pattern guards coupon `usedCount` in `lib/coupons.ts`.

### Retry on collision

Order numbers derive from a count, so concurrent checkouts can collide on the unique constraint. Generate inside the transaction and retry on `P2002` (unique violation) or `P2028` (transaction expired):

```ts
for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
  try { order = await createOrder(); break }
  catch (e) {
    const code = (e as { code?: string })?.code
    if (code === 'P2002' || code === 'P2028') continue
    throw e
  }
}
```

### Transaction bounds

Prisma's default interactive-transaction timeout is 5s, which is not enough against a remote database under load. Order creation passes explicit bounds:

```ts
prisma.$transaction(async (tx) => { /* … */ }, { maxWait: 10_000, timeout: 20_000 })
```

### Never trust client money

Prices, discounts and totals are always recomputed server-side from the database. The client sends product *identifiers* and a coupon *code* — never amounts.

---

## Working with the database

**`prisma db push` only.** There is no migrations folder. After editing `schema.prisma`:

```bash
npx prisma generate    # regenerate the typed client
npx prisma db push     # apply to the database
# then RESTART the dev server — see Gotchas
```

`npx prisma studio` gives you a browsable UI.

**Index policy:** don't add `@@index` on a column that's already `@unique` — Postgres indexes it automatically and the duplicate only costs write throughput.

---

## Common tasks

### Add an admin section

1. `app/admin/<name>/page.tsx` — Server Component, fetch and map rows
2. `app/admin/<name>/<Name>Table.tsx` — `'use client'`, define columns, render `AdminDataTable`
3. `app/api/admin/<name>/route.ts` — `ensureAdmin()` first, Zod-validated
4. Add the nav entry in `app/admin/layout.tsx`
5. Add any new audit action to `AuditAction`

### Add a static page

```tsx
import StaticPage, { Section } from '@/component/common/StaticPage'

export const metadata = { title: '…', description: '…' }

export default function Page() {
  return (
    <StaticPage title="…" label="…" intro="…">
      <Section heading="…"><p>…</p></Section>
    </StaticPage>
  )
}
```

Then add the link to `component/layout/Footer.tsx`.

### Add a transactional WhatsApp message

1. Add a params builder in `lib/whatsapp/templates.ts`
2. Send via `sendWhatsAppTemplate({ to: toWhatsAppPhone(phone), templateName, bodyParams })`
3. Record the outcome as a `WhatsAppMessage` row and an audit entry

`sendWhatsAppTemplate` **never throws** — it returns `{ success, error }`. A messaging failure must never fail the underlying order or payment operation.

---

## Gotchas

These each cost real debugging time.

### Restart the dev server after a schema change

The running server holds the **old generated Prisma client in memory**. After `db push`, queries against new fields fail with `Unknown argument 'x'` or `Argument 'x' must not be null` — even though `tsc` passes, because the on-disk types *are* updated. **Restart `npm run dev`.** This has bitten twice.

### `EPERM` on `prisma generate` (Windows)

The dev server locks `query_engine-windows.dll.node`. Stop the dev server, then generate.

### Stale `.next` after deleting routes

Deleting a route leaves `.next/types/validator.ts` referencing it, producing `Cannot find module '…/route.js'` from `tsc`. Fix: `rm -rf .next`.

### `proxy.ts` must stay dependency-light

Importing Prisma or `next/headers` into the proxy makes it silently stop running — requests pass straight through with no error. That's why `SESSION_COOKIE` lives in `lib/auth/constants.ts` rather than `session.ts`.

Symptom: protected routes still redirect (because pages have their own guards) but a route *without* a page-level guard is wide open. Confirm the proxy is alive by looking for a `proxy.ts:` segment in the dev server's request timing log.

### Use explicit matchers in `proxy.ts`

The inherited catch-all regex matcher only ever matched `/`. Explicit paths (`'/account'`, `'/account/:path*'`) are both correct and cheaper.

### Escaping in generated code

Writing TypeScript via shell heredocs mangles backslashes. A template literal `` `^\\d{6}$` `` became `^d{6}$`, so **no OTP could ever validate** — and it typechecked fine. Prefer regex literals over dynamically built `RegExp`, and always exercise the path.

### Server Components can't pass functions

See the table wrapper pattern above.

### Client components need `NEXT_PUBLIC_`

`WHATSAPP_NUMBER` is server-only; the floating chat button reads `NEXT_PUBLIC_WHATSAPP_NUMBER`. Both exist for this reason.

### Hydration and randomness

Never generate random or time-based values during render — the server and client produce different HTML. The captcha generates its code in a `useEffect` after mount for exactly this reason.

---

## Testing & verification

There is no automated test suite. Before considering work done:

```bash
npx tsc --noEmit -p .    # must be clean
npm run lint             # 0 errors (1 known TanStack/React-Compiler warning)
npm run build            # must succeed
```

Then exercise the actual flows. `tsc` will not catch a wrong regex, a race condition, or a stale client.

**Useful checks**

```bash
# Route protection (expect 307)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/account

# Admin API without a session (expect 401)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/orders
```

**Testing authenticated routes without burning OTP quota.** With a live MiniMoth key, every `send-otp` sends a real message and counts against the limit (3 per number per 10 minutes). Mint a session cookie directly instead — sign a JWT with `JWT_SECRET` using the same claims as `lib/auth/jwt.ts` (`userId`, `phoneNumber`, `isAdmin`) and pass it as the `gemeria_session` cookie.

**Concurrency.** For anything touching stock or coupons, fire parallel requests and assert the invariant:

```bash
for i in 1 2 3 4 5; do curl -s -X POST … -o /dev/null -w "%{http_code}\n" & done; wait
```

Against `stock=2`, the correct result is exactly two `200`s and three `409`s — and final stock of `0`, never negative.

**Clean up after yourself.** Tests here run against the real database. Remove test orders, leads, coupons and users when finished.
