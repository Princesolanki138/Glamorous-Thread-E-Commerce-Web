import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { couponSchema, ok, err, validationErr } from '@/lib/validations'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = couponSchema.partial().safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  const existing = await prisma.coupon.findUnique({ where: { id } })
  if (!existing) return err('Coupon not found', 404)

  const { startsAt, expiresAt, ...rest } = parsed.data

  try {
    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...rest,
        startsAt: startsAt !== undefined ? (startsAt ? new Date(startsAt) : null) : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
      },
    })

    await createAuditLog({
      action: 'COUPON_UPDATED',
      entityType: 'Coupon',
      entityId: id,
      before: existing,
      after: updated,
    })

    return ok(updated)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return err('A coupon with this code already exists.', 409)
    }
    throw e
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params

  const existing = await prisma.coupon.findUnique({ where: { id } })
  if (!existing) return err('Coupon not found', 404)

  await prisma.coupon.delete({ where: { id } })

  await createAuditLog({
    action: 'COUPON_DELETED',
    entityType: 'Coupon',
    entityId: id,
    before: existing,
  })

  return ok({ id })
}
