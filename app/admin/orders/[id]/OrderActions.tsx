'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Loader2 } from 'lucide-react'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'

const ORDER_STATUSES = [
  'PENDING', 'WHATSAPP_SENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
] as const

interface OrderActionsProps {
  orderId: string
  currentStatus: string
  order: {
    orderNumber: string
    createdAt: string
    shippingName: string
    shippingPhone: string
    shippingEmail: string | null
    shippingLine1: string
    shippingLine2: string | null
    shippingCity: string
    shippingState: string
    shippingPincode: string
    shippingCountry: string
    subtotal: number
    shipping: number
    total: number
    notes: string | null
    items: {
      productTitle: string
      variantLabel: string | null
      quantity: number
      price: number
    }[]
  }
}

export default function OrderActions({ orderId, currentStatus, order }: OrderActionsProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    const prev = status
    setStatus(newStatus)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        alert(data?.error || 'Unable to update status.')
        setStatus(prev)
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const whatsappMessage = buildWhatsAppMessage({
    orderNumber: order.orderNumber,
    createdAt: new Date(order.createdAt),
    customer: {
      name: order.shippingName,
      phone: order.shippingPhone,
      email: order.shippingEmail || undefined,
    },
    address: {
      line1: order.shippingLine1,
      line2: order.shippingLine2 || undefined,
      city: order.shippingCity,
      state: order.shippingState,
      pincode: order.shippingPincode,
      country: order.shippingCountry,
    },
    items: order.items.map((i) => ({
      productTitle: i.productTitle,
      variantLabel: i.variantLabel || undefined,
      quantity: i.quantity,
      price: i.price,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    notes: order.notes || undefined,
  })
  const whatsappUrl = buildWhatsAppUrl(whatsappMessage)

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="flex items-center gap-2">
        {loading && <Loader2 size={14} className="animate-spin text-[#6B7280]" />}
        <select
          value={status}
          disabled={loading}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3A3A3A] disabled:opacity-50"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-1.5 rounded-xl border border-[#25D366]/20 bg-[#25D366]/5 px-4 py-2.5 text-sm text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
      >
        <MessageCircle size={14} />
        Resend WhatsApp
      </a>
    </div>
  )
}
