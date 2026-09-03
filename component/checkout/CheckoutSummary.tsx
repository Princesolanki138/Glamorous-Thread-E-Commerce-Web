'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2, Tag, Truck, X } from 'lucide-react'
import { useCartStore } from '@/cart/cartStore'
import { useCheckoutStore } from '@/cart/checkoutStore'

type Props = { compact?: boolean }

export default function CheckoutSummary({ compact = false }: Props) {
  const { cart, getSubtotal } = useCartStore()
  const { coupon, applyCoupon } = useCheckoutStore()
  const subtotal = getSubtotal()
  const shipping = subtotal >= 599 ? 0 : 99

  const [code, setCode] = useState('')
  const [applying, setApplying] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  // The server recomputes this at order time; this is display only.
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0
  const total = Math.max(0, subtotal - discount) + shipping

  const onApply = async () => {
    if (!code.trim() || applying) return
    setApplying(true)
    setCouponError(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setCouponError(data?.error || 'That discount code is not valid.')
        return
      }
      applyCoupon({ code: data.data.code, discount: data.data.discount })
      setCode('')
    } catch {
      setCouponError('Could not check that code. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const onRemove = () => {
    applyCoupon(null)
    setCouponError(null)
  }

  const attrs = (item: typeof cart[0]) =>
    [item.color, item.texture, item.length].filter(Boolean).join(' · ')

  return (
    <div>
      {/* Items */}
      <div className={`space-y-4 ${compact ? '' : 'mb-8'}`}>
        {cart.length === 0 && (
          <p className="text-[#555555] text-sm text-center py-6">Your cart is empty</p>
        )}
        {cart.map((item) => (
          <div key={item.variantId} className="flex gap-4 items-start">
            {/* Image */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] shrink-0">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
              {/* Qty bubble */}
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D4D4D4] text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center">
                {item.quantity}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium leading-snug truncate">{item.title}</p>
              {attrs(item) && (
                <p className="text-[#555555] text-xs mt-1">{attrs(item)}</p>
              )}
              <p className="text-[#D4D4D4] text-sm font-medium mt-2">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!compact && (
        <>
          {/* Coupon */}
          <div className="my-7">
            {coupon ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 h-12">
                <span className="flex items-center gap-2 text-sm text-emerald-400">
                  <Tag size={13} strokeWidth={1.5} />
                  {coupon.code} applied
                </span>
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label="Remove discount code"
                  className="text-[#8A8A8A] transition-colors hover:text-white"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444444]" strokeWidth={1.5} />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void onApply() } }}
                    placeholder="Discount code"
                    disabled={applying}
                    className="w-full h-12 pl-9 pr-4 rounded-xl border border-[#2A2A2A] bg-[#111111] text-white placeholder-[#444444] outline-none focus:border-[#D4D4D4]/40 transition-colors text-sm uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void onApply()}
                  disabled={applying || !code.trim()}
                  className="h-12 px-5 rounded-xl border border-[#2A2A2A] bg-[#111111] text-[#B8B8B8] text-sm hover:border-[#D4D4D4]/30 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {applying ? <Loader2 size={13} className="animate-spin" /> : null}
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="mt-2 text-xs text-red-400">{couponError}</p>}
          </div>

          {/* Divider */}
          <div className="border-t border-[#1A1A1A] mb-6" />

          {/* Totals */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#8A8A8A]">Subtotal</span>
              <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#8A8A8A]">Discount</span>
                <span className="text-emerald-400">-&#8377;{discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1.5 text-[#8A8A8A]">
                <Truck size={13} strokeWidth={1.5} />
                Shipping
              </span>
              {shipping === 0 ? (
                <span className="text-emerald-400 text-xs uppercase tracking-widest">Free</span>
              ) : (
                <span className="text-white">₹{shipping}</span>
              )}
            </div>

            {subtotal > 0 && subtotal < 599 && (
              <p className="text-[#555555] text-xs">
                Add ₹{(599 - subtotal).toLocaleString('en-IN')} more for free shipping
              </p>
            )}

            <div className="border-t border-[#1A1A1A] pt-4 mt-4 flex justify-between items-center">
              <span className="text-[#8A8A8A] text-sm uppercase tracking-widest">Total</span>
              <span className="font-cormorant text-3xl text-white">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <p className="text-[#444444] text-xs mt-4">
            Inclusive of all taxes. Delivery in 2–6 business days.
          </p>
        </>
      )}
    </div>
  )
}
