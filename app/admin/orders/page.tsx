import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Prisma, OrderStatus } from '@prisma/client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import OrdersTable, { type OrderRow } from './OrdersTable'

const PAGE_SIZE = 20

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING', 'WHATSAPP_SENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>
}) {
  const { page: pageParam, status: statusParam, q: qParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const status = statusParam && ORDER_STATUSES.includes(statusParam as OrderStatus) ? (statusParam as OrderStatus) : undefined
  const q = qParam?.trim()

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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const orderRows: OrderRow[] = items.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    shippingName: order.shippingName,
    shippingPhone: order.shippingPhone,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAtLabel: order.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
  }))

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    params.set('page', String(targetPage))
    return `/admin/orders?${params.toString()}`
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-[#6B7280] mt-1">{total} order{total !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      <form method="GET" className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search order #, name, or phone"
          className="flex-1 min-w-50 rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#3A3A3A]"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3A3A3A]"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-[#E5E5E5] transition-colors"
        >
          Filter
        </button>
        {(status || q) && (
          <Link
            href="/admin/orders"
            className="text-sm text-[#6B7280] hover:text-white transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <OrdersTable orders={orderRows} />

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
