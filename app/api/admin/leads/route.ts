import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { ok } from '@/lib/validations'
import type { Prisma, LeadSource, LeadStatus } from '@prisma/client'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const status = searchParams.get('status') as LeadStatus | null
  const source = searchParams.get('source') as LeadSource | null

  const where: Prisma.LeadWhereInput = {}
  if (status) where.status = status
  if (source) where.source = source

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
  ])

  return ok({ items, total, page, pageSize: PAGE_SIZE })
}
