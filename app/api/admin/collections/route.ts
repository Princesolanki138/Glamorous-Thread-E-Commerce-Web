import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { collectionSchema, ok, err, validationErr } from '@/lib/validations'

export async function GET() {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const collections = await prisma.collection.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  return ok(collections)
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

  const parsed = collectionSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)
  const data = parsed.data

  try {
    const created = await prisma.collection.create({
      data: { ...data, image: data.image || null },
    })

    await createAuditLog({
      action: 'COLLECTION_CREATED',
      entityType: 'Collection',
      entityId: created.id,
      after: { title: created.title, slug: created.slug },
    })

    return ok(created, 201)
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return err('A collection with this slug already exists.', 409)
    }
    console.error('COLLECTION_CREATE_ERROR', error)
    return err('Unable to create collection.', 500)
  }
}
