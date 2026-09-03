import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { ok, err, validationErr } from '@/lib/validations'

const roleUpdateSchema = z.object({ isAdmin: z.boolean() })

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!user) return err('Customer not found', 404)

  return ok(user)
}

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

  const parsed = roleUpdateSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  const targetUser = await prisma.user.findUnique({ where: { id } })
  if (!targetUser) return err('Customer not found', 404)

  if (targetUser.id === check.user.id) {
    return err('You cannot change your own admin role.', 400)
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isAdmin: parsed.data.isAdmin },
  })

  await createAuditLog({
    action: 'USER_ROLE_UPDATED',
    entityType: 'User',
    entityId: id,
    before: { isAdmin: targetUser.isAdmin },
    after: { isAdmin: updated.isAdmin },
    targetUserId: id,
  })

  return ok(updated)
}
