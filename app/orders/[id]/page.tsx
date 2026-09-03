import { getSession } from '@/lib/auth/session'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Footer } from '@/component/layout/Footer'
import AccountHeader from '@/component/layout/AccountHeader'
import { ArrowLeft, MessageCircle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
  WHATSAPP_SENT: 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20',
  CONFIRMED:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PROCESSING:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SHIPPED:       'bg-sky-500/10 text-sky-400 border-sky-500/20',
  DELIVERED:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED:     'bg-red-500/10 text-red-400 border-red-500/20',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const dbUser = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!dbUser) redirect('/auth/login')

  const order = await prisma.order.findUnique({
    where:   { id },
    include: { items: true },
  })

  if (!order || order.userId !== dbUser.id) notFound()

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <AccountHeader />

      <main className="px-4 sm:px-6 lg:px-12 py-16">
        <div className="max-w-3xl mx-auto">

          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm text-[#8A8A8A] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={15} />
            Back to Orders
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <div className="section-label mb-3">Order Details</div>
              <h1 className="font-cormorant text-4xl text-white tracking-tight">{order.orderNumber}</h1>
              <p className="text-[#8A8A8A] text-sm mt-1">
                Placed on{' '}
                {order.createdAt.toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full border uppercase tracking-wide w-fit ${STATUS_COLORS[order.status] ?? 'bg-[#1F1F1F] text-[#BFC0C2] border-[#262626]'}`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>

          {/* Items */}
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-[#1A1A1A] bg-[#0E0E0E]">
              <p className="text-[10px] uppercase tracking-widest text-[#555555]">Items</p>
            </div>
            <div className="divide-y divide-[#1A1A1A]">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center px-6 py-4">
                  {item.productImageUrl && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] shrink-0">
                      <Image src={item.productImageUrl} alt={item.productTitle} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.productTitle}</p>
                    {item.variantLabel && (
                      <p className="text-[#555555] text-xs mt-0.5">{item.variantLabel}</p>
                    )}
                    <p className="text-[#8A8A8A] text-sm mt-1">Qty {item.quantity}</p>
                  </div>
                  <p className="text-white text-sm font-medium shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-6 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#8A8A8A]">Subtotal</span>
              <span className="text-white">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8A8A8A]">Shipping</span>
              <span className="text-white">
                {order.shipping === 0 ? 'Free' : `₹${order.shipping.toLocaleString('en-IN')}`}
              </span>
            </div>
            <div className="border-t border-[#1A1A1A] pt-3 flex justify-between items-center">
              <span className="text-[#8A8A8A] text-sm uppercase tracking-widest">Total</span>
              <span className="font-cormorant text-2xl text-white">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-6 mb-8">
            <p className="text-[10px] uppercase tracking-widest text-[#555555] mb-3">Delivering to</p>
            <p className="text-white text-sm font-medium">{order.shippingName}</p>
            <p className="text-[#8A8A8A] text-sm mt-1">{order.shippingPhone}</p>
            <p className="text-[#8A8A8A] text-sm mt-1">
              {order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ''}
            </p>
            <p className="text-[#8A8A8A] text-sm">
              {order.shippingCity}, {order.shippingState} — {order.shippingPincode}
            </p>
          </div>

          <a
            href="https://wa.me/918104834173"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#25D366] hover:text-[#1ebe5d] transition-colors"
          >
            <MessageCircle size={15} />
            Need help with this order? Chat with us on WhatsApp
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}
