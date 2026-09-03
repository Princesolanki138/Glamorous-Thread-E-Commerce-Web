'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/cart/cartStore'

export default function CartDrawer() {
  const router = useRouter()

  const { cart, isOpen, closeCart, removeFromCart, increaseQuantity, decreaseQuantity, getSubtotal } =
    useCartStore()

  const handleCheckout = () => {
    closeCart()
    router.push('/checkout')
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-[#111111] border-l border-[#262626] z-[100] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#262626]">
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Cart</h2>
            <span className="text-sm text-[#9CA3AF]">({cart.length} items)</span>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full border border-[#262626] flex items-center justify-center text-[#9CA3AF] hover:text-white hover:border-white/30 transition-all"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border border-[#262626] flex items-center justify-center mb-6">
                <ShoppingBag size={28} className="text-[#6B7280]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Your cart is empty</h3>
              <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-xs mb-8">
                Discover premium hair essentials crafted for seamless beauty and confidence.
              </p>
              <Link
                href="/collection"
                onClick={closeCart}
                className="luxury-button"
              >
                Shop Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.variantId}
                  className="bg-[#151515] border border-[#262626] rounded-2xl p-4 hover:border-[#BFC0C2]/20 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#1A1A1A] shrink-0">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white text-sm leading-snug truncate mb-1">
                            {item.title}
                          </h3>
                          {(item.color || item.texture || item.length) && (
                            <p className="text-xs text-[#9CA3AF] mb-2">
                              {[item.color, item.texture, item.length].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <p className="text-white font-semibold text-sm">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-[#6B7280] hover:text-red-400 transition-colors shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Quantity */}
                      <div className="mt-3 inline-flex items-center border border-[#262626] rounded-full overflow-hidden">
                        <button
                          onClick={() => decreaseQuantity(item.variantId)}
                          className="w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F] transition-all"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm text-white font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item.variantId)}
                          className="w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F] transition-all"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-[#262626] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#9CA3AF] text-sm">Subtotal</span>
              <span className="text-2xl font-bold text-white">
                ₹{getSubtotal().toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Shipping and taxes calculated at checkout.
            </p>
            <button
              onClick={handleCheckout}
              className="w-full h-14 bg-white text-[#0A0A0A] rounded-2xl font-semibold text-sm tracking-wide hover:bg-[#BFC0C2] transition-all duration-300 flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
