import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ok, err, validationErr } from '@/lib/validations'
import { validateCoupon } from '@/lib/coupons'

const schema = z.object({
  code: z.string().min(1).max(64),
  subtotal: z.number().nonnegative(),
})

/**
 * Checkout preview only: tells the customer whether a code applies and by how
 * much. The authoritative discount is recomputed during order creation, so a
 * tampered response here cannot change what is actually charged.
 */
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  const result = await validateCoupon(parsed.data.code, parsed.data.subtotal)
  if (!result.ok) return err(result.error, 400)

  return ok({
    code: result.code,
    discount: result.discount,
    discountType: result.discountType,
    discountValue: result.discountValue,
  })
}
