import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import StatCard from '@/component/admin/StatCard'
import RevenueChart from '@/component/admin/RevenueChart'
import {
  IndianRupee,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  Star,
} from 'lucide-react'

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
  WHATSAPP_SENT: 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20',
  CONFIRMED:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PROCESSING:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SHIPPED:       'bg-sky-500/10 text-sky-400 border-sky-500/20',
  DELIVERED:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED:     'bg-red-500/10 text-red-400 border-red-500/20',
}

const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CONTACTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  QUALIFIED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CONVERTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED:    'bg-[#1F1F1F] text-[#9CA3AF] border-[#2A2A2A]',
}

export default async function AdminDashboardPage() {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sevenDaysAgo = new Date(startOfToday)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const fourteenDaysAgo = new Date(startOfToday)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13) // 14 days inclusive of today

  const [
    revenueAgg,
    ordersToday,
    activeProducts,
    lowStockVariants,
    newLeads,
    pendingReviews,
    revenueOrders,
    recentOrders,
    recentLeads,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: startOfThisMonth }, status: { not: 'CANCELLED' } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
    prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.review.count({ where: { approved: false } }),
    prisma.order.findMany({
      where: { createdAt: { gte: fourteenDaysAgo }, status: { not: 'CANCELLED' } },
      select: { createdAt: true, total: true },
    }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  // Bucket revenue by calendar day for the last 14 days.
  const dayBuckets = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(fourteenDaysAgo)
    d.setDate(d.getDate() + i)
    return {
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: 0,
    }
  })
  for (const order of revenueOrders) {
    const d = new Date(order.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    const bucket = dayBuckets.find((b) => b.key === key)
    if (bucket) bucket.revenue += order.total
  }
  const chartData = dayBuckets.map(({ date, revenue }) => ({ date, revenue }))

  const stats = [
    { label: 'Revenue This Month', value: `₹${(revenueAgg._sum.total ?? 0).toLocaleString('en-IN')}`, icon: IndianRupee },
    { label: 'Orders Today', value: String(ordersToday), icon: ShoppingBag },
    { label: 'Active Products', value: String(activeProducts), icon: Package },
    { label: 'Low Stock Variants', value: String(lowStockVariants), icon: AlertTriangle },
    { label: 'New Leads (7d)', value: String(newLeads), icon: Users },
    { label: 'Pending Reviews', value: String(pendingReviews), icon: Star },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-[#6B7280] mt-1">Overview of store performance</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      {/* Revenue chart + recent leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-5">
          <div className="mb-4">
            <p className="text-xs text-[#6B7280] uppercase tracking-widest">Revenue</p>
            <p className="text-sm text-[#9CA3AF] mt-0.5">Last 14 days</p>
          </div>
          <RevenueChart data={chartData} />
        </div>

        <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F1F1F]">
            <p className="text-xs text-[#6B7280] uppercase tracking-widest">Recent Leads</p>
            <Link href="/admin/leads" className="text-xs text-[#6B7280] hover:text-white transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[#1A1A1A] flex-1">
            {recentLeads.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[#555555]">No leads yet.</p>
            ) : (
              recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#141414] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{lead.name}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5 truncate">
                      {lead.subject || lead.source.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wider ${LEAD_STATUS_COLORS[lead.status] ?? ''}`}
                  >
                    {lead.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F1F1F]">
          <p className="text-xs text-[#6B7280] uppercase tracking-widest">Recent Orders</p>
          <Link href="/admin/orders" className="text-xs text-[#6B7280] hover:text-white transition-colors">
            View all
          </Link>
        </div>
        <div className="divide-y divide-[#1A1A1A]">
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[#555555]">No orders yet.</p>
          ) : (
            recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-[#141414] transition-colors"
              >
                <div className="min-w-0 flex items-center gap-4">
                  <span className="font-mono text-xs text-[#D4D4D4] border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 rounded-lg shrink-0">
                    {order.orderNumber.slice(0, 8)}
                  </span>
                  <span className="text-sm text-white truncate">{order.shippingName || 'Guest'}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full border uppercase tracking-wider ${ORDER_STATUS_COLORS[order.status] ?? ''}`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-white w-24 text-right">₹{order.total.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-[#6B7280] w-28 text-right hidden sm:inline">
                    {order.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
