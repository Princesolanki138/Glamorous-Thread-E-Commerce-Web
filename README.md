# Glamorous Thread — E-Commerce Platform

A Next.js 16 storefront and admin panel for **Glamorous Thread** , selling premium 100% human hair wigs, extensions and toppers in India.

The platform is built around a **WhatsApp-first sales motion**: customers browse and check out on the website, but the order hand-off and payment coordination happen over WhatsApp — which is where the business already operates. There is no payment gateway; an admin confirms payment manually after verifying receipt.

📖 **[User Guide](docs/USER-GUIDE.md)** — running the store day to day (admin manual + customer flows)
🛠 **[Developer Guide](docs/DEVELOPER-GUIDE.md)** — architecture, conventions, and how to extend the codebase

---

## Contents

1. [Feature overview](#feature-overview)
2. [Tech stack](#tech-stack)
3. [How it fits together](#how-it-fits-together)
4. [Order & payment flow](#order--payment-flow)
5. [Authentication](#authentication)
6. [Database](#database)
7. [API reference](#api-reference)
8. [Environment variables](#environment-variables)
9. [Getting started](#getting-started)
10. [Project structure](#project-structure)
11. [Deployment](#deployment)
12. [Known gaps](#known-gaps)

---

## Feature overview

**Storefront**
- Product catalogue with collections, variants (colour / length / texture) and per-variant stock
- Cart (browser-persisted), checkout, and discount codes
- Mobile OTP sign-in — no passwords
- Customer account: order history, order detail, editable profile
- Product reviews (admin-moderated) and wishlists
- 12 informational pages (About, FAQs, policies, size guide, …) and a working contact form

**Admin panel** — 11 sections covering products, collections, orders, customers, leads, inventory, reviews, wishlist analytics, audit logs and coupons.

**Integrations** — WhatsApp Business Cloud API for transactional messages, MiniMoth for OTP delivery, Cloudinary for image uploads.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack), React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion, GSAP, Lenis |
| Client state | Zustand (cart + checkout stores) |
| Backend | Next.js Route Handlers — no separate server |
| Validation | Zod |
| Database | PostgreSQL (Neon) via Prisma 6.19 |
| Auth | Custom mobile OTP + JWT sessions (`jose`) |
| OTP delivery | MiniMoth (WhatsApp-first, SMS fallback) or WhatsApp Cloud API |
| Payments | **None** — manual admin confirmation |
| Images | Cloudinary (unsigned browser upload) |
| Admin UI | TanStack Table v8, Recharts v3, Tiptap |

---

## How it fits together

```
Customer browser
      │
      ├─ Storefront pages (Server Components) ──► Prisma ──► Neon Postgres
      ├─ Cart (Zustand, localStorage)
      │
      └─ Checkout ──► POST /api/whatsapp-order
                          ├─ re-reads prices & stock from the DB
                          ├─ re-validates any coupon
                          ├─ creates Order + decrements stock (one transaction)
                          └─ returns a prefilled wa.me link
                                    │
                                    ▼
                        Customer's WhatsApp opens with the order

Admin panel  (session cookie, User.isAdmin = true)
      │
      ├─ Confirm Order ──► status CONFIRMED, paymentStatus PAYMENT_PENDING
      │                    └─ WhatsApp payment-request template sent
      │
      └─ Mark as Paid ──► paymentStatus PAID, paidAt set
                           └─ WhatsApp payment-success template sent
```

**Nothing the browser sends about money is trusted.** Prices, stock and discounts are all recomputed server-side from the database at order time.

---

## Order & payment flow

| Step | What happens |
|---|---|
| 1 | Customer submits the cart from `/checkout` |
| 2 | Server re-reads variant prices and stock; a client-sent price is ignored |
| 3 | Any discount code is re-validated and the discount recomputed server-side |
| 4 | Shipping applied: **₹99, free on orders ≥ ₹599** |
| 5 | `Order` + `OrderItem[]` created, stock decremented, `InventoryLog` written — all in one transaction |
| 6 | Browser opens a `wa.me` link with the order summary |
| 7 | Admin reviews the order and clicks **Confirm Order** → `CONFIRMED` / `PAYMENT_PENDING`, payment instructions sent over WhatsApp |
| 8 | Customer pays **outside the app** (UPI / bank transfer) |
| 9 | Admin verifies receipt and clicks **Mark as Paid** → `PAID`, confirmation sent |

**Order status:** `PENDING → WHATSAPP_SENT → CONFIRMED → PROCESSING → SHIPPED → DELIVERED` (plus `CANCELLED`, which restocks inventory).
**Payment status:** `UNPAID → PAYMENT_PENDING → PAID` (plus `FAILED`, `REFUNDED`).

> There is no webhook, because there is no gateway. `Mark as Paid` is the only path to `PAID`.

---

## Authentication

Passwordless **mobile OTP**. The phone number is the login identifier.

1. `POST /api/auth/send-otp` — a 6-digit code is delivered
2. `POST /api/auth/verify-otp` — on success the account is created if new, and a session is issued
3. A signed JWT is set as an **HTTP-only cookie** (`gemeria_session`, HS256, 30 days)

**OTP provider** is chosen automatically:
- `MINIMOTH_API_KEY` set → **MiniMoth** (tries WhatsApp, falls back to SMS; handles expiry and rate limits server-side)
- otherwise → **self-hosted**: code generated locally, HMAC-hashed, delivered via your own WhatsApp Cloud API template
- neither configured (development only) → the code is printed to the server log so the flow stays testable

**Security:** OTPs are stored as an HMAC (never plaintext), expire after 5 minutes, are capped at 5 attempts, rate-limited to one send per 30s, and burned on use. Admin API routes call `ensureAdmin()`, which re-reads `isAdmin` from the database rather than trusting the token — so revoking an admin takes effect immediately.

**After login:** admins land on `/admin/dashboard`, everyone else on `/account`. If the visitor was bounced off a protected page, they return there instead.

**Making someone an admin:**
```bash
npm run seed -- 9876543210
```

---

## Database

16 models. The ones you'll touch most:

| Model | Purpose |
|---|---|
| **User** | Account keyed by `phoneNumber`; holds profile + default address and the `isAdmin` flag |
| **Otp / OtpLog** | Short-lived OTP challenges (hashed) and a delivery/verification audit trail |
| **Collection → Product → ProductVariant** | Catalogue. Variants are the purchasable SKUs and carry stock |
| **ProductImage** | Cloudinary-hosted gallery images |
| **Order → OrderItem** | Orders with denormalised shipping fields and snapshotted line items |
| **WhatsAppMessage** | Delivery log for every outbound transactional message |
| **Review / Wishlist** | Customer engagement; reviews need admin approval to appear |
| **Lead** | CRM records, fed by the public contact form |
| **InventoryLog** | Immutable record of every stock movement |
| **Coupon** | Discount codes, applied at checkout |
| **AuditLog** | Every admin action, with before/after snapshots, actor, IP and user agent |

Schema changes are applied with **`prisma db push`** — there is no migrations folder.

---

## API reference

All responses use a shared envelope: `{ success: true, data }` or `{ success: false, error }` (validation failures add `fields`).

### Public

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/send-otp` | POST | Send a login code |
| `/api/auth/verify-otp` | POST | Verify the code, create the session, return `redirectTo` |
| `/api/auth/logout` | POST | Clear the session |
| `/api/user` | GET, PATCH | Read / update the signed-in user's profile |
| `/api/whatsapp-order` | POST | Place an order |
| `/api/coupons/validate` | POST | Check a discount code at checkout |
| `/api/leads` | POST | Contact form submission |
| `/api/reviews` | POST | Submit a review (sign-in required) |
| `/api/wishlist/[productId]` | POST, DELETE | Add / remove from wishlist |

### Admin — every handler starts with `ensureAdmin()`

| Endpoint | Methods |
|---|---|
| `/api/admin/orders`, `/api/admin/orders/[id]` | GET, PATCH |
| `/api/admin/orders/[id]/confirm` · `/mark-paid` · `/resend-payment` | POST |
| `/api/admin/products`, `/api/admin/products/[id]` | GET, POST, PATCH, DELETE |
| `/api/admin/collections`, `/api/admin/collections/[id]` | GET, POST, PATCH, DELETE |
| `/api/admin/coupons`, `/api/admin/coupons/[id]` | GET, POST, PATCH, DELETE |
| `/api/admin/customers`, `/api/admin/customers/[id]` | GET, PATCH |
| `/api/admin/leads`, `/api/admin/leads/[id]` | GET, PATCH |
| `/api/admin/reviews`, `/api/admin/reviews/[id]` | GET, PATCH, DELETE |
| `/api/admin/inventory/[variantId]/adjust` | POST |

---

## Environment variables

Copy `.env.example` to `.env` and fill in. Full explanations live in that file.

**Required**
```
DATABASE_URL              # Neon pooled connection
DATABASE_URL_UNPOOLED     # Neon direct connection (used by prisma db push)
JWT_SECRET                # random, 32+ chars — signs sessions and hashes OTPs
```

**Recommended**
```
MINIMOTH_API_KEY          # OTP delivery (WhatsApp first, SMS fallback)
MINIMOTH_BASE_URL         # https://api.minimoth.dev/v1
CLOUDINARY_URL
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
WHATSAPP_NUMBER           # store number, E.164 without '+'
NEXT_PUBLIC_WHATSAPP_NUMBER
```

**Optional — WhatsApp Cloud API** (transactional messages, and OTP if not using MiniMoth)
```
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_API_VERSION
WHATSAPP_OTP_TEMPLATE_NAME
WHATSAPP_OTP_TEMPLATE_HAS_BUTTON
WHATSAPP_PAYMENT_TEMPLATE_NAME
WHATSAPP_PAYMENT_SUCCESS_TEMPLATE_NAME
OTP_EXPIRY_MINUTES
```

> `JWT_SECRET` also keys the OTP hash. Rotating it invalidates every session **and** every outstanding OTP.

---

## Getting started

```bash
git clone <repository-url>
cd gemeriaecomproject
npm install

cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET at minimum

npx prisma generate
npx prisma db push

npm run seed -- Enter your number   # make this phone number an admin
npm run dev                  # http://localhost:3000
```

Generate a `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

**Scripts**
```bash
npm run dev        npm run build      npm run start
npm run lint       npm run db:push    npm run db:studio
npm run seed -- <phone>
```

---

## Project structure

```
app/
├─ (storefront)           /, /collection, /product/[slug], /checkout, /orders
├─ account/ user-profile/ Signed-in customer area
├─ auth/                  login, signup
├─ admin/                 11-section admin panel
├─ api/                   Route handlers (auth, orders, admin, …)
└─ <static pages>         about-us, faqs, privacy-policy, …

component/
├─ admin/ auth/ account/ cart/ checkout/ collections/
├─ common/                StaticPage shell, ContactForm
├─ layout/ products/ sections/ animations/ lib/

cart/                     Zustand stores (cart, checkout)
lib/
├─ auth/                  jwt, session, otp, phone, provider selection
├─ whatsapp/              cloudApi, templates, order-message, otp-message
├─ validations/           Zod schemas + ok/err/validationErr helpers
├─ coupons.ts  audit.ts  serverAuth.ts  prisma.ts  products.ts  cloudinary.ts

prisma/                   schema.prisma + seed scripts
proxy.ts                  Route protection (Next 16's middleware)
docs/                     User and developer guides
```

---

## Deployment

- **App** — Vercel (or any Node host running `next build && next start`)
- **Database** — Neon Postgres; set both `DATABASE_URL` and `DATABASE_URL_UNPOOLED`
- **Schema** — run `npx prisma generate && npx prisma db push` against the target database as part of deployment
- **Env** — set every variable in the host's environment config; never commit `.env`
- **WhatsApp** — templates must be approved in Meta Business Manager before production sends succeed

---

## Known gaps

Honest list of what is built but not yet wired end to end:

- **Banners** — removed; there is no homepage banner management
- **Newsletter** — removed; the footer signup was deleted along with it
- **`Product.hairColor / hairLength / hairStyle / hairTexture`** — captured in the admin form but not yet surfaced as storefront filters
- **Blog** — the page lists placeholder cards; there is no post model or CMS
- **Social links** — footer icons still point at `#`
- **Lint** — one warning remains, from TanStack Table's incompatibility with React Compiler memoisation. Not fixable in our code.
