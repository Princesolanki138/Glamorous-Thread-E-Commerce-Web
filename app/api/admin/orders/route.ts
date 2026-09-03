import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { ok } from '@/lib/validations'
import type { Prisma, OrderStatus } from '@prisma/client'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const status = searchParams.get('status') as OrderStatus | null
  const q = searchParams.get('q')?.trim()

  const where: Prisma.OrderWhereInput = {}
  if (status) where.status = status
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { shippingPhone: { contains: q, mode: 'insensitive' } },
      { shippingName: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.count({ where }),
  ])

  return ok({ items, total, page, pageSize: PAGE_SIZE })
}
