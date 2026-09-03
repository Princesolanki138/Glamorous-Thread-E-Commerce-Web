# User Guide — Glamorous Thread

How to run your online store. No technical knowledge needed.

**Part 1** is for you — the store owner or a staff member using the admin panel.
**Part 2** describes what your customers see, so you can help them when they get stuck.

---

## Before you start

Your developer needs to have completed the technical setup — connecting the database, image hosting and WhatsApp messaging, and creating your admin account. That is covered in the [Developer Guide](DEVELOPER-GUIDE.md).

Once that's done, all you need is:

- **Your store's web address** (e.g. `https://glamorousthread.com`)
- **Your mobile number**, registered as an admin — this *is* your login; there is no password
- **The admin panel**, at your web address followed by `/admin`

If your number isn't registered as an admin yet, ask your developer to run one command — it takes seconds.

### The five-minute tour

1. Sign in at `/auth/login` with your mobile number
2. You'll land on the **Dashboard**
3. Add a **Collection** (a category, e.g. "Clip-in Extensions")
4. Add a **Product** inside it — and at least one **variant**, since variants are what customers actually buy
5. Open your storefront and place a test order to see the whole flow

Remember to cancel the test order afterwards so the stock goes back.

---

# Part 1 — Running the store (admin)

## Signing in

1. Go to `/auth/login`
2. Enter your registered mobile number, type the captcha, click **Request OTP**
3. Enter the 6-digit code you receive on WhatsApp (or SMS)
4. Admins are taken straight to the **Dashboard**

The code expires after 5 minutes. If it does, request a new one. After 5 wrong attempts the code is cancelled and you'll need a fresh one.

> **Can't sign in?** Your number must be registered as an admin. A developer can do this in one command — see the Developer Guide.

---

## The admin panel at a glance

| Section | What it's for |
|---|---|
| **Dashboard** | Revenue and order charts, headline numbers |
| **Products** | Add and edit products, variants, images, prices |
| **Collections** | Group products into categories |
| **Orders** | The core workflow — confirm, take payment, ship |
| **Customers** | Everyone who's signed in; grant or revoke admin |
| **Leads (CRM)** | Enquiries from the website contact form |
| **Inventory** | Low-stock alerts and manual stock corrections |
| **Reviews** | Approve or reject customer reviews |
| **Wishlist Analytics** | Which products people save most |
| **Audit Logs** | A record of every admin action |
| **Settings** | Discount coupons |

---

## Processing an order — the main workflow

This is the sequence you'll repeat most. **Payment is never automatic** — you confirm it yourself.

### 1. A new order arrives

It appears in **Orders** with status `PENDING` or `WHATSAPP_SENT`, and the customer's WhatsApp message reaches your business number. Stock is already reserved at this point.

### 2. Review and confirm

Open the order and check the items, address and total. Then click **Confirm Order**.

This does three things:
- Sets the order to `CONFIRMED`
- Sets payment to `PAYMENT PENDING`
- Sends the customer a WhatsApp message with your payment instructions

> If the order isn't right — wrong items, a duplicate, a test — click **Reject Order** instead. This cancels it and **returns the stock automatically**.

### 3. The customer pays

Payment happens outside the website — UPI, bank transfer, however you've arranged it. Your payment details come from the approved WhatsApp template, not from the app.

### 4. Confirm you've received the money

**Check your bank or UPI app first.** Once the money is actually there, open the order and click **Mark as Paid**. You can add a note, such as a UPI reference number, which is stored on the audit record.

This sets the order to `PAID`, stamps the time, and sends the customer a payment confirmation on WhatsApp.

> ⚠️ **Mark as Paid is the only thing that marks an order paid, and it can't be undone from the UI.** Always verify the money has arrived first.

### 5. Fulfil the order

Move the status along as you go: `PROCESSING` → `SHIPPED` → `DELIVERED`.

### Customer hasn't paid?

Click **Send Payment Reminder** to re-send the payment instructions. It doesn't change the order status, so you can use it more than once.

---

## Understanding the two statuses

Orders have **two separate statuses**, and they move independently.

**Order status — where it is in fulfilment**

| Status | Meaning |
|---|---|
| `PENDING` | Just placed |
| `WHATSAPP_SENT` | Customer's WhatsApp message was generated |
| `CONFIRMED` | You've accepted it |
| `PROCESSING` | Being prepared |
| `SHIPPED` | On its way |
| `DELIVERED` | Complete |
| `CANCELLED` | Cancelled — stock returned |

**Payment status — whether you've been paid**

| Status | Meaning |
|---|---|
| `UNPAID` | Nothing requested yet |
| `PAYMENT PENDING` | Instructions sent, waiting for money |
| `PAID` | You confirmed receipt |
| `FAILED` / `REFUNDED` | Available for record-keeping |

---

## Products and stock

### Adding a product

**Products → New Product.** You'll need a title, URL slug, description, price and collection.

**Variants are what customers actually buy.** A product with no variants can't be ordered. Each variant is a combination such as *Brown / 18" / Straight*, and each carries **its own stock count**. A variant can override the product price; if you leave its price blank, the product price is used.

Images upload straight to Cloudinary from your browser. Reorder them by their sort order — the first is the main image.

Untick **Active** to hide a product from the storefront without deleting it. This is safer than deleting, since past orders reference it.

### Stock

Stock lives on the **variant**, not the product. It goes down automatically when an order is placed and back up automatically when an order is cancelled.

To correct stock manually — a delivery arrived, breakage, a miscount — use **Inventory**. Every adjustment is logged with a reason, so the history is always explainable.

**Inventory** also lists low-stock variants, which is the quickest way to spot what needs reordering.

---

## Discount coupons

**Settings → Coupons → New Coupon.**

| Field | Notes |
|---|---|
| Code | What the customer types. Case-insensitive |
| Type | `PERCENTAGE` or `FIXED` |
| Value | `10` = 10% off, or ₹10 off, depending on type |
| Minimum order | Optional spend threshold |
| Usage limit | Optional cap on total redemptions |
| Active / dates | Toggle off or schedule a window |

Customers enter the code at checkout and see the discount immediately. The discount is always recalculated on the server, so a coupon can't be tampered with.

Usage counts are safe under load — if two people redeem the last use of a coupon at the same time, only one succeeds.

---

## Customers, leads and reviews

**Customers** lists everyone who's signed in, with order counts and lifetime spend. You can promote someone to admin or revoke it here — you can't change your own role, which prevents locking yourself out.

**Leads (CRM)** collects contact form submissions. Work them through `NEW → CONTACTED → QUALIFIED → CONVERTED` or `CLOSED`, and keep notes on each.

**Reviews** are hidden until you approve them. Approve, reject or delete from the Reviews section.

---

## Audit logs

Every admin action is recorded: who did it, when, from what IP, and what changed. Use this when you need to answer "who marked this paid?" or "when did this price change?"

---

## Things worth knowing

- **Stock is reserved when the order is placed**, not when it's paid. Cancel unpaid orders you don't intend to fulfil, or that stock stays locked up.
- **Free shipping applies at ₹599.** Below that, ₹99 is added.
- **Order numbers** look like `GH-2026-00042` and are never reused.
- **WhatsApp messages can fail** (expired token, unapproved template). The order still succeeds — the failure is recorded on the order and in the audit log. Check there if a customer says they got nothing.

---

# Part 2 — What customers experience

## Browsing and buying

1. Browse from the homepage or **/collection**
2. On a product page, pick a variant (colour, length, texture) and add to cart
3. The cart lives in their browser — it survives closing the tab
4. At **/checkout** they enter delivery details and may apply a discount code
5. Placing the order opens **WhatsApp** with a prefilled summary addressed to your store
6. They then receive your payment instructions and pay directly

Customers **do not need an account to browse**, but signing in lets them keep order history, save a wishlist and leave reviews.

## Signing in

Mobile number → captcha → **Request OTP** → 6-digit code → done. No password ever.

New numbers get an account created automatically on first successful code entry.

## Their account

| Page | What's there |
|---|---|
| `/account` | Order history and status |
| `/orders/[id]` | Full detail of one order |
| `/user-profile` | Name, email and default address — phone number is fixed |

## Help pages

`/contact-us` (with a form that reaches your Leads CRM), `/faqs`, `/shipping-delivery`, `/size-guide`, `/return-exchange`, `/warranty`, `/privacy-policy`, `/terms-of-service`, `/about-us`, `/careers`, `/reviews`, `/blog`.

A WhatsApp chat button floats on every page.

---

## Your first week — a checklist

- [ ] Sign in and confirm you reach the Dashboard
- [ ] Create your collections (categories)
- [ ] Add your products, each with variants, images, prices and stock counts
- [ ] Place a test order end to end — confirm it, mark it paid, then cancel it
- [ ] Check the test order's WhatsApp messages actually arrived
- [ ] Set up any launch discount codes in **Settings**
- [ ] Send the contact form a test message and confirm it appears in **Leads**
- [ ] Add a second admin, so you're not the only person who can get in
- [ ] Review the storefront's policy pages (returns, shipping, warranty) and tell your developer about any wording you want changed

---

## Common questions

**A customer says they never got their code.**
Ask them to check WhatsApp first — codes go there before SMS. Codes last 5 minutes. After 5 wrong attempts they need a new one, and there's a 30-second wait between requests.

**A customer wants to change their phone number.**
They can't — it's their login identity. They'd need a new account, or a developer can update it directly.

**An order is stuck on PAYMENT PENDING.**
That means the money hasn't been confirmed. Check your bank, then **Mark as Paid**. If they never received instructions, use **Send Payment Reminder**.

**I cancelled an order — is the stock back?**
Yes, automatically, and it's recorded in Inventory.

**A discount code isn't working.**
Check it's Active, within its date window, under its usage limit, and that the cart meets any minimum spend. The message shown to the customer explains which rule failed.
