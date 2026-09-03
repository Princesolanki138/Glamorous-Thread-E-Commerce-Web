import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import OrderActions from './OrderActions'
import PaymentActions from './PaymentActions'

const STATUS_COLORS: Record<string, string> = {
  PENDING:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
  WHATSAPP_SENT: 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20',
  CONFIRMED:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PROCESSING:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SHIPPED:       'bg-sky-500/10 text-sky-400 border-sky-500/20',
  DELIVERED:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED:     'bg-red-500/10 text-red-400 border-red-500/20',
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  UNPAID:          'bg-[#1F1F1F] text-[#BFC0C2] border-[#262626]',
  PAYMENT_PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PAID:            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FAILED:          'bg-red-500/10 text-red-400 border-red-500/20',
  REFUNDED:        'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      whatsappMessages: { orderBy: { sentAt: 'desc' }, take: 5 },
    },
  })

  if (!order) notFound()

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Back to Orders
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{order.orderNumber}</h1>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full border uppercase tracking-wide w-fit ${STATUS_COLORS[order.status] ?? 'bg-[#1F1F1F] text-[#BFC0C2] border-[#262626]'}`}>
              {order.status.replace('_', ' ')}
            </span>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full border uppercase tracking-wide w-fit ${PAYMENT_STATUS_COLORS[order.paymentStatus] ?? ''}`}>
              {order.paymentStatus.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            Placed on{' '}
            {order.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <PaymentActions
            orderId={order.id}
            orderStatus={order.status}
            paymentStatus={order.paymentStatus}
          />
          <OrderActions
          orderId={order.id}
          currentStatus={order.status}
          order={{
            orderNumber: order.orderNumber,
            createdAt: order.createdAt.toISOString(),
            shippingName: order.shippingName,
            shippingPhone: order.shippingPhone,
            shippingEmail: order.shippingEmail,
            shippingLine1: order.shippingLine1,
            shippingLine2: order.shippingLine2,
            shippingCity: order.shippingCity,
            shippingState: order.shippingState,
            shippingPincode: order.shippingPincode,
            shippingCountry: order.shippingCountry,
            subtotal: order.subtotal,
            shipping: order.shipping,
            total: order.total,
            notes: order.notes,
            items: order.items.map((i) => ({
              productTitle: i.productTitle,
              variantLabel: i.variantLabel,
              quantity: i.quantity,
              price: i.price,
            })),
          }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1F1F1F] bg-[#141414]">
              <p className="text-xs uppercase tracking-widest text-[#6B7280]">Items</p>
            </div>
            <div className="divide-y divide-[#1F1F1F]">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center px-6 py-4">
                  {item.productImageUrl && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#141414] border border-[#1F1F1F] shrink-0">
                      <Image src={item.productImageUrl} alt={item.productTitle} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.productTitle}</p>
                    {item.variantLabel && (
                      <p className="text-[#6B7280] text-xs mt-0.5">{item.variantLabel}</p>
                    )}
                    <p className="text-[#9CA3AF] text-sm mt-1">Qty {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <p className="text-white text-sm font-medium shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#9CA3AF]">Subtotal</span>
              <span className="text-white">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#9CA3AF]">
                  Discount{order.couponCode ? ` (${order.couponCode})` : ''}
                </span>
                <span className="text-emerald-400">-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[#9CA3AF]">Shipping</span>
              <span className="text-white">
                {order.shipping === 0 ? 'Free' : `₹${order.shipping.toLocaleString('en-IN')}`}
              </span>
            </div>
            <div className="border-t border-[#1F1F1F] pt-3 flex justify-between items-center">
              <span className="text-[#9CA3AF] text-sm uppercase tracking-widest">Total</span>
              <span className="text-xl font-bold text-white">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
              <p className="text-xs uppercase tracking-widest text-[#6B7280] mb-2">Customer Notes</p>
              <p className="text-sm text-[#D1D5DB]">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Payment */}
          <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
            <p className="text-xs uppercase tracking-widest text-[#6B7280] mb-3">Payment</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Status</span>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border uppercase tracking-wide ${PAYMENT_STATUS_COLORS[order.paymentStatus] ?? ''}`}>
                  {order.paymentStatus.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Amount Due</span>
                <span className="text-white">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Paid At</span>
                  <span className="text-white">
                    {order.paidAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
              {order.paymentStatus === 'UNPAID' && (
                <p className="text-xs text-[#555555] pt-1">No payment request sent yet — confirm the order to notify the customer over WhatsApp.</p>
              )}
            </div>

            {order.whatsappMessages.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#1F1F1F]">
                <p className="text-xs uppercase tracking-widest text-[#6B7280] mb-2">WhatsApp</p>
                <div className="space-y-1.5">
                  {order.whatsappMessages.map((msg) => (
                    <div key={msg.id} className="flex items-center justify-between text-xs">
                      <span className="text-[#9CA3AF]">{msg.messageType.replace('_', ' ')}</span>
                      <span className={msg.status === 'SENT' ? 'text-emerald-400' : 'text-red-400'}>
                        {msg.status === 'SENT' ? 'Sent' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
            <p className="text-xs uppercase tracking-widest text-[#6B7280] mb-3">Customer</p>
            <p className="text-white text-sm font-medium">{order.shippingName || '—'}</p>
            <p className="text-[#9CA3AF] text-sm mt-1">{order.shippingPhone || '—'}</p>
            {order.shippingEmail && (
              <p className="text-[#9CA3AF] text-sm mt-1">{order.shippingEmail}</p>
            )}
          </div>

          {/* Shipping address */}
          <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
            <p className="text-xs uppercase tracking-widest text-[#6B7280] mb-3">Shipping Address</p>
            <p className="text-[#D1D5DB] text-sm">
              {order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ''}
            </p>
            <p className="text-[#D1D5DB] text-sm">
              {order.shippingCity}, {order.shippingState} — {order.shippingPincode}
            </p>
            <p className="text-[#D1D5DB] text-sm">{order.shippingCountry}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
