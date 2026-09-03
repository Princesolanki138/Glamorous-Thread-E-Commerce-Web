import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { collectionSchema, ok, err, validationErr } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params
  const collection = await prisma.collection.findUnique({ where: { id } })
  if (!collection) return err('Collection not found', 404)

  return ok(collection)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

  const parsed = collectionSchema.partial().safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  const before = await prisma.collection.findUnique({ where: { id } })
  if (!before) return err('Collection not found', 404)

  try {
    const updated = await prisma.collection.update({
      where: { id },
      data: { ...parsed.data, image: parsed.data.image || undefined },
    })

    await createAuditLog({
      action: 'COLLECTION_UPDATED',
      entityType: 'Collection',
      entityId: id,
      before: { title: before.title },
      after: { title: updated.title },
    })

    return ok(updated)
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return err('A collection with this slug already exists.', 409)
    }
    console.error('COLLECTION_UPDATE_ERROR', error)
    return err('Unable to update collection.', 500)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params
  const existing = await prisma.collection.findUnique({ where: { id } })
  if (!existing) return err('Collection not found', 404)

  const productCount = await prisma.product.count({ where: { collectionId: id } })
  if (productCount > 0) {
    return err(
      `Cannot delete — ${productCount} product${productCount === 1 ? '' : 's'} still belong to this collection.`,
      409,
    )
  }

  await prisma.collection.delete({ where: { id } })

  await createAuditLog({
    action: 'COLLECTION_DELETED',
    entityType: 'Collection',
    entityId: id,
    before: { title: existing.title, slug: existing.slug },
  })

  return ok({ id })
}
