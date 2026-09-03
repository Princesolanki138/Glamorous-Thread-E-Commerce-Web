import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { ok, err, validationErr, orderStatusSchema } from '@/lib/validations'
import { createAuditLog } from '@/lib/audit'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!order) return err('Order not found', 404)

  return ok(order)
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

  const parsed = orderStatusSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)
  const { status: newStatus } = parsed.data

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })
  if (!order) return err('Order not found', 404)

  const oldStatus = order.status

  let updatedOrder
  try {
    if (newStatus === 'CANCELLED' && oldStatus !== 'CANCELLED') {
      updatedOrder = await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          // The variant may have been removed from the catalogue since the
          // order was placed, in which case there is no stock to restore.
          if (!item.variantId) continue

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          })
          await tx.inventoryLog.create({
            data: {
              variantId: item.variantId,
              change: item.quantity,
              reason: 'ORDER_CANCELLED',
              note: `Order ${order.orderNumber} cancelled`,
            },
          })
        }

        return tx.order.update({
          where: { id },
          data: { status: newStatus },
        })
      })
    } else {
      updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: newStatus },
      })
    }
  } catch (error) {
    console.error('ORDER_STATUS_UPDATE_ERROR', error)
    return err('Unable to update order status right now. Please try again.', 500)
  }

  await createAuditLog({
    action: 'ORDER_STATUS_UPDATED',
    entityType: 'Order',
    entityId: order.id,
    before: { status: oldStatus },
    after: { status: newStatus },
  })

  return ok(updatedOrder)
}
