import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { couponSchema, ok, err, validationErr } from '@/lib/validations'

export async function GET() {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return ok(coupons)
}

export async function POST(req: NextRequest) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = couponSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  const { startsAt, expiresAt, ...rest } = parsed.data

  try {
    const created = await prisma.coupon.create({
      data: {
        ...rest,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    })

    await createAuditLog({
      action: 'COUPON_CREATED',
      entityType: 'Coupon',
      entityId: created.id,
      after: created,
    })

    return ok(created, 201)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return err('A coupon with this code already exists.', 409)
    }
    throw e
  }
}
