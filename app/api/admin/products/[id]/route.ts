import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { productSchema, variantSchema, assetUrlSchema, ok, err, validationErr } from '@/lib/validations'

const productWriteSchema = productSchema.extend({
  images: z
    .array(z.object({ url: assetUrlSchema, alt: z.string().optional() }))
    .default([]),
  variants: z.array(variantSchema).default([]),
})

type VariantShape = {
  color?: string | null
  length?: string | null
  texture?: string | null
  sku?: string | null
  stock: number
  price?: number | null
  comparePrice?: number | null
}

/** Order-independent comparison key for a variant. */
function variantKey(v: VariantShape) {
  return JSON.stringify([
    v.color ?? null,
    v.length ?? null,
    v.texture ?? null,
    v.sku ?? null,
    v.stock,
    v.price ?? null,
    v.comparePrice ?? null,
  ])
}

/**
 * Whether the submitted variants match what is already stored. Re-saving a
 * product without touching its variants must not delete and recreate them:
 * that would detach them from past order lines and wipe their inventory logs.
 */
function sameVariantSet(a: VariantShape[], b: VariantShape[]) {
  if (a.length !== b.length) return false
  const ka = a.map(variantKey).sort()
  const kb = b.map(variantKey).sort()
  return ka.every((key, i) => key === kb[i])
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true, collection: true },
  })
  if (!product) return err('Product not found', 404)

  return ok(product)
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

  const parsed = productWriteSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)
  const { images, variants, collectionId, ...productData } = parsed.data

  const before = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  })
  if (!before) return err('Product not found', 404)

  const variantsChanged = !sameVariantSet(before.variants, variants)

  // Past order lines point at variants. Replacing them would silently detach
  // that history, so only touch them when they actually changed, and refuse
  // when an order still refers to them.
  if (variantsChanged) {
    const referenced = await prisma.orderItem.count({
      where: { variantId: { in: before.variants.map((v) => v.id) } },
    })
    if (referenced > 0) {
      return err(
        'Cannot change variants — one or more are referenced by past orders. Deactivate the product instead of changing its variants.',
        409,
      )
    }
  }

  try {
    // One transaction: a failure part-way through must not leave the product
    // stripped of its images and variants.
    const updated = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } })
      if (variantsChanged) {
        await tx.productVariant.deleteMany({ where: { productId: id } })
      }

      return tx.product.update({
        where: { id },
        data: {
          ...productData,
          collection: { connect: { id: collectionId } },
          images: { create: images.map((img, i) => ({ url: img.url, alt: img.alt, sortOrder: i })) },
          ...(variantsChanged ? { variants: { create: variants } } : {}),
        },
        include: { images: true, variants: true, collection: true },
      })
    },
    // Neon round-trips make Prisma's default 5s interactive-transaction budget
    // too tight for this multi-statement write, matching the checkout route.
    { maxWait: 10_000, timeout: 20_000 },
    )

    await createAuditLog({
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: id,
      before: { title: before.title, price: before.price },
      after: { title: updated.title, price: updated.price },
    })

    return ok(updated)
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return err('A product with this slug already exists.', 409)
    }
    const code = (error as { code?: string })?.code
    if (code === 'P2003' || code === 'P2014') {
      return err(
        'Cannot update variants — one or more existing variants are referenced by past orders. Deactivate the product instead of changing its variants.',
        409,
      )
    }
    console.error('PRODUCT_UPDATE_ERROR', error)
    return err('Unable to update product.', 500)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) return err('Product not found', 404)

  try {
    await prisma.product.delete({ where: { id } })

    await createAuditLog({
      action: 'PRODUCT_DELETED',
      entityType: 'Product',
      entityId: id,
      before: { title: existing.title, slug: existing.slug },
    })

    return ok({ id })
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2003' || code === 'P2014') {
      return err(
        'Cannot delete — this product has existing orders, reviews, or wishlist entries. Mark it inactive instead.',
        409,
      )
    }
    console.error('PRODUCT_DELETE_ERROR', error)
    return err('Unable to delete product.', 500)
  }
}
