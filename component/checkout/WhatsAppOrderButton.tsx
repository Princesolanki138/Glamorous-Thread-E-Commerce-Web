'use client'

import { useState } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/cart/cartStore'
import { useCheckoutStore } from '@/cart/checkoutStore'

interface CartItem {
  variantId:        string
  quantity:         number
  price:            number
  productTitle:     string
  variantLabel?:    string
  productImageUrl?: string
}

interface Props {
  formData: {
    firstName: string
    lastName:  string
    phone:     string
    email?:    string
    line1:     string
    line2?:    string
    city:      string
    state:     string
    pincode:   string
    country:   string
    notes?:    string
  }
  items:     CartItem[]
  disabled?: boolean
}

type Phase = 'idle' | 'creating' | 'preparing' | 'redirecting'

const PHASE_LABEL: Record<Phase, string> = {
  idle:        'PLACE ORDER ON WHATSAPP',
  creating:    'Creating Order…',
  preparing:   'Preparing WhatsApp…',
  redirecting: 'Redirecting…',
}

const PHASE_HINT: Record<Phase, string> = {
  idle:        '',
  creating:    'Saving your order to our system…',
  preparing:   'Building your order message…',
  redirecting: 'Taking you to the confirmation page…',
}

export default function WhatsAppOrderButton({ formData, items, disabled }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const { clearCart }     = useCartStore()
  const { coupon, applyCoupon } = useCheckoutStore()

  async function handleOrder() {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setPhase('creating')

    try {
      const res = await fetch('/api/whatsapp-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        // Only the code travels; the server recomputes the discount itself.
        body:    JSON.stringify({ ...formData, items, couponCode: coupon?.code }),
      })
      const json = await res.json()

      if (!json.success) {
        toast.error(json.error ?? 'Failed to place order')
        setPhase('idle')
        return
      }

      setPhase('preparing')

      // Store WhatsApp URL in sessionStorage — success page reads it to auto-open
      try {
        sessionStorage.setItem('gemeria_wa_url',    json.data.whatsappUrl)
        sessionStorage.setItem('gemeria_wa_order',  json.data.orderNumber)
      } catch {}

      clearCart()
      applyCoupon(null)

      setPhase('redirecting')

      // Navigate to success page — WhatsApp opens from there, bypassing popup blockers
      window.location.href = `/order-success?order=${json.data.orderNumber}`

    } catch {
      toast.error('Something went wrong. Please try again.')
      setPhase('idle')
    }
  }

  const loading = phase !== 'idle'

  return (
    <div className="space-y-3">
      <button
        onClick={handleOrder}
        disabled={disabled || loading}
        className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#17a852] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-widest uppercase py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg shadow-[#25D366]/20"
      >
        {loading
          ? <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          : <MessageCircle className="w-5 h-5 shrink-0" />
        }
        {PHASE_LABEL[phase]}
      </button>

      {phase !== 'idle' && (
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-1 rounded-full bg-[#25D366] animate-pulse" />
          <p className="text-center text-xs text-[#555555]">{PHASE_HINT[phase]}</p>
        </div>
      )}
    </div>
  )
}
