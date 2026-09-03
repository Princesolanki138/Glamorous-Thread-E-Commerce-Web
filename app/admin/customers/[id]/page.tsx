import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Mail, Phone, Calendar, ShieldCheck, Heart } from 'lucide-react'
import AdminRoleToggle from './AdminRoleToggle'

const STATUS_COLORS: Record<string, string> = {
  PENDING:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
  WHATSAPP_SENT: 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20',
  CONFIRMED:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PROCESSING:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SHIPPED:       'bg-sky-500/10 text-sky-400 border-sky-500/20',
  DELIVERED:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED:     'bg-red-500/10 text-red-400 border-red-500/20',
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [user, wishlistCount, session] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    }),
    prisma.wishlist.count({ where: { userId: id } }),
    getSession(),
  ])

  if (!user) notFound()

  const isSelf = user.id === session?.userId

  return (
    <div>
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Back to Customers
      </Link>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{user.name || 'Unnamed Customer'}</h1>
            {user.isAdmin && (
              <span className="flex items-center gap-1 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[#BFC0C2]">
                <ShieldCheck size={11} />
                Admin
              </span>
            )}
          </div>
          <p className="text-sm text-[#6B7280] mt-1">Customer profile &amp; order history</p>
        </div>
        {!isSelf && <AdminRoleToggle userId={user.id} isAdmin={user.isAdmin} />}
      </div>

      {/* Profile card */}
      <div className="mb-6 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Mail size={16} className="text-[#6B7280] mt-0.5" />
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide">Email</p>
              <p className="text-sm text-white mt-0.5">{user.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone size={16} className="text-[#6B7280] mt-0.5" />
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide">Phone</p>
              <p className="text-sm text-white mt-0.5">{user.phoneNumber}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar size={16} className="text-[#6B7280] mt-0.5" />
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide">Joined</p>
              <p className="text-sm text-white mt-0.5">
                {user.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Heart size={16} className="text-[#6B7280] mt-0.5" />
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide">Wishlist Items</p>
              <p className="text-sm text-white mt-0.5">{wishlistCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order history */}
      <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1F1F1F]">
          <p className="text-xs uppercase tracking-widest text-[#6B7280]">Recent Orders</p>
        </div>
        {user.orders.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-[#555555]">No orders placed yet.</p>
        ) : (
          <div className="divide-y divide-[#1A1A1A]">
            {user.orders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#D4D4D4] border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 rounded-lg">
                    {order.orderNumber}
                  </span>
                  <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border uppercase tracking-wider ${STATUS_COLORS[order.status] ?? ''}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-xs text-[#6B7280]">
                    {order.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-white font-medium">₹{order.total.toLocaleString('en-IN')}</p>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs text-[#9CA3AF] hover:text-white transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
