import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { reviewSchema, ok, err, validationErr } from '@/lib/validations'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return err('You must be signed in to leave a review.', 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)
  const { productId, rating, comment } = parsed.data

  const product = await prisma.product.findUnique({
    where:  { id: productId },
    select: { id: true },
  })
  if (!product) return err('Product not found', 404)

  const dbUser = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!dbUser) return err('You must be signed in to leave a review.', 401)

  const name = dbUser.name?.trim() || ''

  const review = await prisma.review.create({
    data: { userId: dbUser.id, productId, rating, comment, approved: false },
  })

  return ok(
    {
      id:        review.id,
      rating:    review.rating,
      comment:   review.comment,
      createdAt: review.createdAt.toISOString(),
      userName:  name || dbUser.name || 'Guest',
    },
    201
  )
}
