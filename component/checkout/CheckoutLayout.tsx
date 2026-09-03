'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Check, Lock, MessageCircle } from 'lucide-react'
import CheckoutAddress from './CheckoutAddress'
import CheckoutSummary from './CheckoutSummary'
import WhatsAppOrderButton from './WhatsAppOrderButton'
import { useCheckoutStore } from '@/cart/checkoutStore'
import { useCartStore } from '@/cart/cartStore'

export default function CheckoutLayout() {
  const [step, setStep] = useState<1 | 2>(1)
  const form = useCheckoutStore()
  const { cart } = useCartStore()

  const items = cart.map(item => ({
    variantId:       item.variantId,
    quantity:        item.quantity,
    price:           item.price,
    productTitle:    item.title,
    variantLabel:    [item.color, item.texture, item.length].filter(Boolean).join(' | ') || undefined,
    productImageUrl: item.image,
  }))

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white">

      {/* Header */}
      <header className="border-b border-[#1E1E1E] bg-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-cormorant text-2xl text-white tracking-wider">
            Glamorous Thread
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-sm">
            {[
              { n: 1, label: 'Shipping' },
              { n: 2, label: 'Review & Order' },
            ].map(({ n, label }, idx) => (
              <div key={n} className="flex items-center gap-2">
                {idx > 0 && (
                  <div className="flex gap-1 mx-2">
                    <div className={`w-4 h-px ${step > 1 ? 'bg-[#D4D4D4]/40' : 'bg-[#222222]'}`} />
                    <div className={`w-4 h-px ${step > 1 ? 'bg-[#D4D4D4]/40' : 'bg-[#222222]'}`} />
                  </div>
                )}
                <div className={`flex items-center gap-2 ${step >= n ? 'text-white' : 'text-[#444444]'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border ${
                    step > n ? 'bg-[#D4D4D4] text-[#0A0A0A] border-[#D4D4D4]' :
                    step === n ? 'border-[#D4D4D4]/60 text-white' : 'border-[#333333] text-[#444444]'
                  }`}>
                    {step > n ? <Check size={13} strokeWidth={2.5} /> : n}
                  </span>
                  <span className="text-xs uppercase tracking-widest">{label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[#555555] text-xs">
            <Lock size={12} strokeWidth={1.5} />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px]">

        {/* Left — Form */}
        <section className="px-6 md:px-12 lg:px-16 py-12 border-r border-[#1A1A1A] min-h-[calc(100vh-65px)]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1"
                initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22,1,0.36,1] }}>
                <CheckoutAddress onContinue={() => setStep(2)} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2"
                initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22,1,0.36,1] }}>
                <div className="max-w-xl">
                  <div className="section-label mb-3">Step 2 of 2</div>
                  <h1 className="font-cormorant text-4xl text-white tracking-tight">Review &amp; Place Order</h1>
                  <p className="text-[#8A8A8A] text-sm mt-2 mb-10">
                    Your order will be created and we&apos;ll open WhatsApp for you to confirm.
                  </p>

                  {/* Shipping summary */}
                  <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-5 mb-8 space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-[#555555] mb-3">Delivering to</p>
                    <p className="text-white text-sm font-medium">{form.firstName} {form.lastName}</p>
                    <p className="text-[#8A8A8A] text-sm">{form.phone}</p>
                    <p className="text-[#8A8A8A] text-sm">{form.line1}{form.line2 ? `, ${form.line2}` : ''}</p>
                    <p className="text-[#8A8A8A] text-sm">{form.city}, {form.state} — {form.pincode}</p>
                    <button onClick={() => setStep(1)} className="text-xs text-[#D4D4D4]/60 hover:text-white mt-2 underline">
                      Edit address
                    </button>
                  </div>

                  {/* Mobile order summary */}
                  <div className="lg:hidden mb-8 rounded-2xl border border-[#2A2A2A] bg-[#111111] p-5">
                    <CheckoutSummary compact />
                  </div>

                  {/* WhatsApp order button */}
                  <WhatsAppOrderButton
                    formData={{
                      firstName: form.firstName,
                      lastName:  form.lastName,
                      phone:     form.phone,
                      email:     form.email || undefined,
                      line1:     form.line1,
                      line2:     form.line2 || undefined,
                      city:      form.city,
                      state:     form.state,
                      pincode:   form.pincode,
                      country:   form.country,
                      notes:     form.notes || undefined,
                    }}
                    items={items}
                  />

                  <div className="mt-6 flex items-center gap-2.5 text-xs text-[#555555]">
                    <MessageCircle size={13} strokeWidth={1.5} className="text-[#25D366]/60 shrink-0" />
                    Your order is saved in our system, then opened in WhatsApp for confirmation.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right — Summary */}
        <aside className="bg-[#0A0A0A] px-6 md:px-8 py-12 border-l border-[#1A1A1A]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#555555] mb-6">Order Summary</p>
          <CheckoutSummary />
        </aside>
      </main>
    </div>
  )
}
