import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Footer } from '@/component/layout/Footer'
import AccountHeader from '@/component/layout/AccountHeader'
import { ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
  WHATSAPP_SENT: 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20',
  CONFIRMED:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PROCESSING:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SHIPPED:       'bg-sky-500/10 text-sky-400 border-sky-500/20',
  DELIVERED:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED:     'bg-red-500/10 text-red-400 border-red-500/20',
}

export default async function OrdersPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const dbUser = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!dbUser) redirect('/auth/login')

  const orders = await prisma.order.findMany({
    where:   { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        select: { productTitle: true, quantity: true, price: true, variantLabel: true },
      },
    },
  })

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <AccountHeader />

      <main className="px-4 sm:px-6 lg:px-12 py-16">
        <div className="max-w-4xl mx-auto">

          <div className="mb-10">
            <div className="section-label mb-3">My Account</div>
            <h1 className="font-cormorant text-4xl text-white tracking-tight">My Orders</h1>
            <p className="text-[#8A8A8A] text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-[#2A2A2A] bg-[#111111]">
              <ShoppingBag className="w-12 h-12 text-[#2A2A2A] mb-4" strokeWidth={1} />
              <h2 className="font-cormorant text-2xl text-white mb-2">No orders yet</h2>
              <p className="text-[#555555] text-sm mb-8">When you place an order, it will appear here.</p>
              <Link href="/collection" className="luxury-button text-sm">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="rounded-2xl border border-[#2A2A2A] bg-[#111111] overflow-hidden hover:border-[#3A3A3A] transition-colors">

                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-[#1A1A1A] bg-[#0E0E0E]">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-[#D4D4D4] border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 rounded-lg">
                        {order.orderNumber}
                      </span>
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border uppercase tracking-wider ${STATUS_COLORS[order.status] ?? ''}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[#555555] text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Items preview */}
                  <div className="px-6 py-4">
                    <div className="space-y-2 mb-4">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{item.productTitle}</p>
                            {item.variantLabel && (
                              <p className="text-[#555555] text-xs mt-0.5">{item.variantLabel}</p>
                            )}
                          </div>
                          <p className="text-[#8A8A8A] text-sm shrink-0">× {item.quantity}</p>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-[#444444] text-xs">+{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1A]">
                      <div>
                        <p className="text-[#555555] text-xs uppercase tracking-widest">Total</p>
                        <p className="font-cormorant text-2xl text-white">₹{order.total.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {order.status === 'PENDING' || order.status === 'WHATSAPP_SENT' ? (
                          <a
                            href="https://wa.me/918104834173"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#25D366]/20 bg-[#25D366]/5 text-[#25D366] text-xs hover:bg-[#25D366]/10 transition-colors"
                          >
                            <MessageCircle size={13} />
                            Follow up
                          </a>
                        ) : null}
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] text-[#B8B8B8] text-xs hover:text-white hover:border-[#D4D4D4]/30 transition-all"
                        >
                          View Details
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <a
              href="https://wa.me/918104834173"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#25D366] hover:text-[#1ebe5d] transition-colors"
            >
              <MessageCircle size={15} />
              Need help? Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
