import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AccountHeader from '@/component/layout/AccountHeader'
import { Footer } from '@/component/layout/Footer'
import { Package, ChevronRight, ShoppingBag, MessageCircle, ShieldCheck, UserRound } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
  WHATSAPP_SENT: 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20',
  CONFIRMED:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PROCESSING:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SHIPPED:       'bg-sky-500/10 text-sky-400 border-sky-500/20',
  DELIVERED:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED:     'bg-red-500/10 text-red-400 border-red-500/20',
}

/**
 * Loads the signed-in customer's orders. Kept as a named function so the page
 * can derive its row type from the query rather than falling back to `any`.
 */
async function loadOrders(userId: string) {
  const rawOrders = await prisma.order.findMany({
    where:   { userId },
    include: {
      items: {
        include: {
          variant: { include: { product: { select: { title: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return rawOrders.map(order => ({
    ...order,
    total:     Number(order.total),
    createdAt: order.createdAt.toISOString(),
  }))
}

type AccountOrder = Awaited<ReturnType<typeof loadOrders>>[number]

export default async function AccountPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isAdmin: true },
  })

  let orders: AccountOrder[] = []
  let accountError: string | null = null

  try {
    // The user row is created during OTP verification, so there is nothing to
    // upsert here - just read the orders belonging to the session's user.
    orders = await loadOrders(session.userId)
  } catch (error) {
    console.error('ACCOUNT_PAGE_ERROR', error)
    accountError = 'Unable to load your orders right now. Please try again later.'
  }

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <AccountHeader />

      <main className="px-4 sm:px-6 lg:px-12 py-16">
        <div className="max-w-5xl mx-auto">

          <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">My Orders</h1>
              <p className="text-[#9CA3AF] mt-2">Review your recent purchases and delivery status.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/user-profile"
                className="inline-flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-5 py-3 text-sm text-[#B8B8B8] transition-colors hover:border-[#D4D4D4]/40 hover:text-white"
              >
                <UserRound size={15} strokeWidth={1.5} />
                My Profile
              </Link>

              {user?.isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-5 py-3 text-sm text-[#D4D4D4] transition-colors hover:border-[#D4D4D4]/40 hover:text-white"
                >
                  <ShieldCheck size={15} strokeWidth={1.5} />
                  Go to Admin Panel
                </Link>
              )}
            </div>
          </div>

          {accountError ? (
            <div className="luxury-card p-10 text-center">
              <p className="text-[#9CA3AF] mb-6">{accountError}</p>
              <Link href="/" className="luxury-button">Continue Shopping</Link>
            </div>
          ) : orders.length === 0 ? (
            <div className="luxury-card p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border border-[#262626] flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-9 h-9 text-[#6B7280]" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">No orders yet</h2>
              <p className="text-[#9CA3AF] mb-8">Place your first order to see it here.</p>
              <Link href="/" className="luxury-button">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)
                return (
                  <div key={order.id} className="luxury-card p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#1A1A1A] border border-[#262626] flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-[#BFC0C2]" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-lg">{order.orderNumber}</p>
                          <p className="text-[#9CA3AF] text-sm mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full border uppercase tracking-wide ${STATUS_COLORS[order.status] ?? 'bg-[#1F1F1F] text-[#BFC0C2] border-[#262626]'}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <span className="text-white font-bold text-lg">
                          ₹{Number(order.total).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-[#262626] pt-5 mb-5">
                      <div>
                        <p className="text-[#6B7280] text-xs uppercase tracking-wide mb-1">Items</p>
                        <p className="text-white font-medium">{totalItems}</p>
                      </div>
                      <div>
                        <p className="text-[#6B7280] text-xs uppercase tracking-wide mb-1">Via</p>
                        <div className="flex items-center gap-1.5 text-[#25D366]">
                          <MessageCircle size={13} />
                          <span className="text-sm font-medium">WhatsApp</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[#6B7280] text-xs uppercase tracking-wide mb-1">City</p>
                        <p className="text-white font-medium">{order.shippingCity || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[#6B7280] text-xs uppercase tracking-wide mb-1">State</p>
                        <p className="text-white font-medium">{order.shippingState || '—'}</p>
                      </div>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#BFC0C2] hover:text-white transition-colors"
                    >
                      View Order Details
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
