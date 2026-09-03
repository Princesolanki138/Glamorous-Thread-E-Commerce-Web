import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { whatsappOrderSchema, ok, err, validationErr } from '@/lib/validations'
import { buildWhatsAppMessage, buildWhatsAppUrl, generateOrderNumber } from '@/lib/whatsapp'
import { createAuditLog } from '@/lib/audit'
import { validateCoupon, claimCouponUse } from '@/lib/coupons'

/** Raised when a coupon is exhausted between validation and order creation. */
class CouponExhaustedError extends Error {
  constructor() {
    super('COUPON_EXHAUSTED')
    this.name = 'CouponExhaustedError'
  }
}

/** Raised when a guarded stock decrement finds insufficient stock mid-transaction. */
class OutOfStockError extends Error {
  constructor(public variantId: string) {
    super('OUT_OF_STOCK')
    this.name = 'OutOfStockError'
  }
}

const FREE_SHIPPING_THRESHOLD = 599
const SHIPPING_FEE = 99

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = whatsappOrderSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)
  const input = parsed.data

  // Re-fetch authoritative price & stock from the database — never trust
  // the price the client sent along with the cart item.
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: input.items.map((i) => i.variantId) } },
    include: { product: { select: { title: true, price: true, isActive: true } } },
  })
  const variantMap = new Map(variants.map((v) => [v.id, v]))

  for (const item of input.items) {
    const variant = variantMap.get(item.variantId)
    if (!variant || !variant.product.isActive) {
      return err('One or more items in your cart are no longer available.', 400)
    }
    if (variant.stock < item.quantity) {
      return err(`${variant.product.title} only has ${variant.stock} left in stock.`, 400)
    }
  }

  const orderItemsData = input.items.map((item) => {
    const variant = variantMap.get(item.variantId)!
    return {
      variantId:       item.variantId,
      quantity:        item.quantity,
      price:           variant.price ?? variant.product.price,
      productTitle:    variant.product.title,
      variantLabel:    item.variantLabel,
      productImageUrl: item.productImageUrl,
    }
  })

  const subtotal = orderItemsData.reduce((sum, i) => sum + i.price * i.quantity, 0)

  // Re-validate the coupon and recompute the discount server-side. The client
  // only sends the code; the amount it displayed is never trusted.
  let discount = 0
  let couponCode: string | null = null
  if (input.couponCode?.trim()) {
    const result = await validateCoupon(input.couponCode, subtotal)
    if (!result.ok) return err(result.error, 400)
    discount = result.discount
    couponCode = result.code
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = Math.max(0, subtotal - discount) + shipping

  const session = await getSession()
  let dbUserId: string | undefined
  if (session) {
    const dbUser = await prisma.user.findUnique({ where: { id: session.userId } })
    dbUserId = dbUser?.id
  }

  // The order number is derived from a count, so two concurrent checkouts can
  // land on the same value. Generating it inside the transaction and retrying
  // on a unique-constraint collision keeps the human-readable format without
  // dropping orders.
  const MAX_ATTEMPTS = 5
  let order: Awaited<ReturnType<typeof createOrder>> | undefined
  let lastError: unknown

  async function createOrder() {
    return prisma.$transaction(async (tx) => {
      const orderCount = await tx.order.count()
      const orderNumber = generateOrderNumber(orderCount + 1)

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId:          dbUserId,
          status:          'PENDING',
          subtotal,
          shipping,
          discount,
          couponCode,
          total,
          shippingName:    `${input.firstName} ${input.lastName}`.trim(),
          shippingPhone:   input.phone,
          shippingEmail:   input.email || null,
          shippingLine1:   input.line1,
          shippingLine2:   input.line2 || null,
          shippingCity:    input.city,
          shippingState:   input.state,
          shippingPincode: input.pincode,
          shippingCountry: input.country,
          notes:           input.notes || null,
          items: { create: orderItemsData },
        },
      })

      if (couponCode) {
        // Guarded increment inside the transaction, so concurrent checkouts
        // cannot push usage past the coupon's limit.
        const claimed = await claimCouponUse(couponCode, tx)
        if (!claimed) throw new CouponExhaustedError()
      }

      for (const item of input.items) {
        // Guarded decrement: the `stock: { gte }` filter makes this an atomic
        // compare-and-swap, so two concurrent orders cannot both claim the
        // last unit and drive stock negative.
        const claimed = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data:  { stock: { decrement: item.quantity } },
        })
        if (claimed.count === 0) {
          throw new OutOfStockError(item.variantId)
        }

        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            change:    -item.quantity,
            reason:    'ORDER_PLACED',
            note:      `Order ${orderNumber}`,
          },
        })
      }

      return created
    },
    // Prisma's default interactive-transaction timeout is 5s. Against a remote
    // (Neon) database under concurrent checkouts that is easily exceeded, which
    // surfaced as an opaque "Transaction already closed" 500 during load
    // testing. These bounds give the transaction room without hanging a request.
    { maxWait: 10_000, timeout: 20_000 },
    )
  }

  try {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        order = await createOrder()
        break
      } catch (error) {
        if (error instanceof OutOfStockError) throw error
        if (error instanceof CouponExhaustedError) throw error
        // P2002 = another checkout took this order number first.
        // P2028 = the transaction expired under contention.
        // Both are transient: retry with a freshly computed sequence.
        const code = (error as { code?: string })?.code
        if (code === 'P2002' || code === 'P2028') {
          lastError = error
          continue
        }
        throw error
      }
    }

    if (!order) throw lastError ?? new Error('Could not allocate an order number.')
  } catch (error) {
    if (error instanceof CouponExhaustedError) {
      return err('That discount code has just reached its usage limit.', 409)
    }
    if (error instanceof OutOfStockError) {
      const variant = variantMap.get(error.variantId)
      return err(
        `${variant?.product.title ?? 'An item'} just went out of stock. Please review your cart.`,
        409,
      )
    }
    console.error('ORDER_CREATE_ERROR', error)
    return err('Unable to place your order right now. Please try again.', 500)
  }

  const message = buildWhatsAppMessage({
    orderNumber: order.orderNumber,
    createdAt:   order.createdAt,
    customer: {
      name:  `${input.firstName} ${input.lastName}`.trim(),
      phone: input.phone,
      email: input.email || undefined,
    },
    address: {
      line1:   input.line1,
      line2:   input.line2 || undefined,
      city:    input.city,
      state:   input.state,
      pincode: input.pincode,
      country: input.country,
    },
    items: orderItemsData.map((i) => ({
      productTitle: i.productTitle,
      variantLabel: i.variantLabel,
      quantity:     i.quantity,
      price:        i.price,
    })),
    subtotal,
    shipping,
    discount,
    couponCode: couponCode ?? undefined,
    total,
    notes: input.notes,
  })
  const whatsappUrl = buildWhatsAppUrl(message)

  await prisma.order.update({
    where: { id: order.id },
    data:  { status: 'WHATSAPP_SENT', whatsappSentAt: new Date() },
  })

  await createAuditLog({
    action:     'ORDER_CREATED',
    entityType: 'Order',
    entityId:   order.id,
    actorId:    dbUserId,
    after:      { orderNumber: order.orderNumber, total },
  })

  return ok({ orderNumber: order.orderNumber, whatsappUrl })
}
