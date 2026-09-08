import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { productDemoSchema, ok, err, validationErr } from '@/lib/validations'

export async function GET() {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const demos = await prisma.productDemo.findMany({
    include: { collection: { select: { title: true, slug: true } } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return ok(demos)
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

  const parsed = productDemoSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)
  const data = parsed.data

  try {
    const created = await prisma.productDemo.create({
      data: { ...data, posterUrl: data.posterUrl || null },
    })

    await createAuditLog({
      action: 'PRODUCT_DEMO_CREATED',
      entityType: 'ProductDemo',
      entityId: created.id,
      after: { title: created.title, collectionId: created.collectionId },
    })

    // Expire immediately rather than the 'max' stale-while-revalidate profile,
    // so the admin sees the new clip on the homepage on the very next visit.
    revalidateTag('product-demos', { expire: 0 })

    return ok(created, 201)
  } catch (error) {
    // P2003 = the chosen collection was deleted between load and submit.
    if ((error as { code?: string })?.code === 'P2003') {
      return err('That collection no longer exists.', 400)
    }
    console.error('PRODUCT_DEMO_CREATE_ERROR', error)
    return err('Unable to create demo video.', 500)
  }
}
