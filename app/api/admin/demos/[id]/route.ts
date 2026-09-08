import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { productDemoSchema, ok, err, validationErr } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params
  const demo = await prisma.productDemo.findUnique({
    where: { id },
    include: { collection: { select: { title: true, slug: true } } },
  })
  if (!demo) return err('Demo video not found', 404)

  return ok(demo)
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

  const parsed = productDemoSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)
  const data = parsed.data

  const before = await prisma.productDemo.findUnique({ where: { id } })
  if (!before) return err('Demo video not found', 404)

  try {
    const updated = await prisma.productDemo.update({
      where: { id },
      data: {
        title: data.title,
        videoUrl: data.videoUrl,
        posterUrl: data.posterUrl || null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        collection: { connect: { id: data.collectionId } },
      },
    })

    await createAuditLog({
      action: 'PRODUCT_DEMO_UPDATED',
      entityType: 'ProductDemo',
      entityId: id,
      before: { title: before.title, collectionId: before.collectionId },
      after: { title: updated.title, collectionId: updated.collectionId },
    })

    revalidateTag('product-demos', { expire: 0 })

    return ok(updated)
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2003' || (error as { code?: string })?.code === 'P2025') {
      return err('That collection no longer exists.', 400)
    }
    console.error('PRODUCT_DEMO_UPDATE_ERROR', error)
    return err('Unable to update demo video.', 500)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params
  const existing = await prisma.productDemo.findUnique({ where: { id } })
  if (!existing) return err('Demo video not found', 404)

  try {
    await prisma.productDemo.delete({ where: { id } })

    await createAuditLog({
      action: 'PRODUCT_DEMO_DELETED',
      entityType: 'ProductDemo',
      entityId: id,
      before: { title: existing.title, videoUrl: existing.videoUrl },
    })

    revalidateTag('product-demos', { expire: 0 })

    return ok({ id })
  } catch (error) {
    console.error('PRODUCT_DEMO_DELETE_ERROR', error)
    return err('Unable to delete demo video.', 500)
  }
}
