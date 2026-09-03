import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/validations'

async function getDbUserId(): Promise<string | null> {
  const session = await getSession()
  if (!session) return null
  const dbUser = await prisma.user.findUnique({ where: { id: session.userId } })
  return dbUser?.id ?? null
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const userId = await getDbUserId()
  if (!userId) return err('You must be signed in.', 401)

  const { productId } = await params
  const product = await prisma.product.findUnique({
    where:  { id: productId },
    select: { id: true },
  })
  if (!product) return err('Product not found', 404)

  await prisma.wishlist.upsert({
    where:  { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  })

  return ok({ wishlisted: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const userId = await getDbUserId()
  if (!userId) return err('You must be signed in.', 401)

  const { productId } = await params
  await prisma.wishlist.deleteMany({ where: { userId, productId } })

  return ok({ wishlisted: false })
}
