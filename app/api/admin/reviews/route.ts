import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { ok } from '@/lib/validations'
import type { Prisma } from '@prisma/client'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const approvedParam = searchParams.get('approved')

  const where: Prisma.ReviewWhereInput = {}
  if (approvedParam === 'true') where.approved = true
  if (approvedParam === 'false') where.approved = false

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { title: true, slug: true } },
      },
    }),
    prisma.review.count({ where }),
  ])

  return ok({ items, total, page, pageSize: PAGE_SIZE })
}
