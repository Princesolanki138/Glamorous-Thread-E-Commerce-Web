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
  const q = searchParams.get('q')?.trim()

  const where: Prisma.UserWhereInput = {}
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phoneNumber: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  const userIds = users.map((u) => u.id)
  const spendByUser = userIds.length
    ? await prisma.order.groupBy({
        by: ['userId'],
        _sum: { total: true },
        where: { userId: { in: userIds } },
      })
    : []

  const spendMap = new Map(
    spendByUser.map((row) => [row.userId, row._sum.total ?? 0])
  )

  const items = users.map((u) => ({
    ...u,
    orderCount: u._count.orders,
    lifetimeSpend: spendMap.get(u.id) ?? 0,
  }))

  return ok({ items, total, page, pageSize: PAGE_SIZE })
}
