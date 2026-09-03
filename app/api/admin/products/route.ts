import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { productSchema, variantSchema, assetUrlSchema, ok, err, validationErr } from '@/lib/validations'

const PAGE_SIZE = 20

const productWriteSchema = productSchema.extend({
  images: z
    .array(z.object({ url: assetUrlSchema, alt: z.string().optional() }))
    .default([]),
  variants: z.array(variantSchema).default([]),
})

export async function GET(req: NextRequest) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const q = searchParams.get('q')?.trim()
  const collectionId = searchParams.get('collectionId')?.trim()

  const where = {
    ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
    ...(collectionId ? { collectionId } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        collection: { select: { title: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        _count: { select: { variants: true } },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ])

  return ok({ items, total, page, pageSize: PAGE_SIZE })
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

  const parsed = productWriteSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)
  const { images, variants, ...productData } = parsed.data

  try {
    const created = await prisma.product.create({
      data: {
        ...productData,
        images: { create: images.map((img, i) => ({ url: img.url, alt: img.alt, sortOrder: i })) },
        variants: { create: variants },
      },
      include: { images: true, variants: true, collection: true },
    })

    await createAuditLog({
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: created.id,
      after: { title: created.title, slug: created.slug, price: created.price },
    })

    return ok(created, 201)
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return err('A product with this slug already exists.', 409)
    }
    console.error('PRODUCT_CREATE_ERROR', error)
    return err('Unable to create product.', 500)
  }
}
