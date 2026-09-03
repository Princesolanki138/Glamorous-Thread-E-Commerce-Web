import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { ok, err, validationErr, inventoryLogSchema } from '@/lib/validations'

const adjustBodySchema = inventoryLogSchema.omit({ variantId: true })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { variantId } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = adjustBodySchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)
  const { change, reason, note } = parsed.data

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } })
  if (!variant) return err('Variant not found', 404)

  if (variant.stock + change < 0) {
    return err(`Cannot remove ${Math.abs(change)} units — only ${variant.stock} in stock.`, 400)
  }

  let updatedVariant
  try {
    ;[updatedVariant] = await prisma.$transaction([
      prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: { increment: change } },
      }),
      prisma.inventoryLog.create({
        data: {
          variantId,
          change,
          reason,
          note,
        },
      }),
    ])
  } catch (error) {
    console.error('INVENTORY_ADJUST_ERROR', error)
    return err('Unable to adjust stock right now. Please try again.', 500)
  }

  return ok(updatedVariant)
}
