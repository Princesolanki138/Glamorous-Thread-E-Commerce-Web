import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { ok, err, validationErr } from '@/lib/validations'

const approvalSchema = z.object({ approved: z.boolean() })

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

  const parsed = approvalSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  const existing = await prisma.review.findUnique({ where: { id } })
  if (!existing) return err('Review not found', 404)

  const updated = await prisma.review.update({
    where: { id },
    data: { approved: parsed.data.approved },
  })

  await createAuditLog({
    action: parsed.data.approved ? 'REVIEW_APPROVED' : 'REVIEW_REJECTED',
    entityType: 'Review',
    entityId: id,
    before: { approved: existing.approved },
    after: { approved: updated.approved },
  })

  return ok(updated)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params

  const existing = await prisma.review.findUnique({ where: { id } })
  if (!existing) return err('Review not found', 404)

  await prisma.review.delete({ where: { id } })

  await createAuditLog({
    action: 'REVIEW_DELETED',
    entityType: 'Review',
    entityId: id,
    before: existing,
  })

  return ok({ id })
}
