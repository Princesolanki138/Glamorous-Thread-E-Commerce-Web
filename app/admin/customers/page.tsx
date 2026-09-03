import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CustomersTable, { type CustomerRow } from './CustomersTable'

const PAGE_SIZE = 20

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page: pageParam, q: qParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const q = qParam?.trim()

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
  const spendMap = new Map(spendByUser.map((row) => [row.userId, row._sum.total ?? 0]))

  const items: CustomerRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email ?? '',
    phone: u.phoneNumber,
    isAdmin: u.isAdmin,
    orderCount: u._count.orders,
    lifetimeSpend: spendMap.get(u.id) ?? 0,
    joinedLabel: u.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  }))

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    params.set('page', String(targetPage))
    return `/admin/customers?${params.toString()}`
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-[#6B7280] mt-1">{total} customer{total !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      <form method="GET" className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name, email, or phone"
          className="flex-1 min-w-50 rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#3A3A3A]"
        />
        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-[#E5E5E5] transition-colors"
        >
          Search
        </button>
        {q && (
          <Link
            href="/admin/customers"
            className="text-sm text-[#6B7280] hover:text-white transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <CustomersTable customers={items} />

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={buildPageHref(Math.max(1, page - 1))}
              aria-disabled={page <= 1}
              className={`flex items-center gap-1 rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-3 py-2 text-xs text-[#9CA3AF] hover:text-white transition-colors ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
            >
              <ChevronLeft size={14} />
              Prev
            </Link>
            <Link
              href={buildPageHref(Math.min(totalPages, page + 1))}
              aria-disabled={page >= totalPages}
              className={`flex items-center gap-1 rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-3 py-2 text-xs text-[#9CA3AF] hover:text-white transition-colors ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
            >
              Next
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
