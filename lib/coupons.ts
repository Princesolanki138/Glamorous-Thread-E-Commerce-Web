import { prisma } from '@/lib/prisma'

export interface CouponResult {
  ok: true
  code: string
  discountType: string
  discountValue: number
  /** Rupee amount to deduct from the subtotal. */
  discount: number
}

export interface CouponError {
  ok: false
  error: string
}

/** Rounds to whole rupees so displayed and charged amounts always agree. */
function round(amount: number) {
  return Math.round(amount)
}

/**
 * Validates a coupon against a subtotal and computes the discount.
 *
 * Shared by the checkout preview endpoint and by order creation, so the amount
 * shown to the customer and the amount actually applied come from the same
 * logic. The discount is always recomputed server-side from the stored coupon;
 * a client-supplied amount is never trusted.
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
): Promise<CouponResult | CouponError> {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { ok: false, error: 'Enter a discount code.' }

  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon || !coupon.isActive) {
    return { ok: false, error: 'That discount code is not valid.' }
  }

  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, error: 'That discount code is not active yet.' }
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { ok: false, error: 'That discount code has expired.' }
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, error: 'That discount code has reached its usage limit.' }
  }
  if (coupon.minOrderAmount !== null && subtotal < coupon.minOrderAmount) {
    return {
      ok: false,
      error: `Spend ₹${coupon.minOrderAmount.toLocaleString('en-IN')} to use this code.`,
    }
  }

  const raw =
    coupon.discountType === 'PERCENTAGE'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue

  // Never discount below zero.
  const discount = round(Math.min(raw, subtotal))

  if (discount <= 0) {
    return { ok: false, error: 'That discount code does not apply to this order.' }
  }

  return {
    ok: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discount,
  }
}

/**
 * Atomically claims one use of a coupon.
 *
 * The `usedCount` guard makes this a compare-and-swap, so concurrent checkouts
 * cannot push usage past the limit. Returns false if the coupon was exhausted
 * between validation and this call.
 */
export async function claimCouponUse(
  code: string,
  tx: Pick<typeof prisma, 'coupon'> = prisma,
): Promise<boolean> {
  const coupon = await tx.coupon.findUnique({ where: { code } })
  if (!coupon) return false

  if (coupon.usageLimit === null) {
    await tx.coupon.update({ where: { code }, data: { usedCount: { increment: 1 } } })
    return true
  }

  const claimed = await tx.coupon.updateMany({
    where: { code, usedCount: { lt: coupon.usageLimit } },
    data: { usedCount: { increment: 1 } },
  })
  return claimed.count > 0
}
