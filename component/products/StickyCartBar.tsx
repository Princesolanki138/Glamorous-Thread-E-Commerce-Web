'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/cart/cartStore'

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function StickyCartBar({ product }: any) {
  const [showBar, setShowBar] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const addToCart = useCartStore((state) => state.addToCart)

  const textures = product?.variants?.length
    ? [...new Set(product.variants.map((v: any) => v.texture).filter(Boolean))] as string[]
    : ['Straight', 'Wavy', 'Curly']

  const colors = product?.variants?.length
    ? [...new Set(product.variants.map((v: any) => v.color).filter(Boolean))] as string[]
    : ['Light Grey', 'Natural Black', 'Dark Brown']

  const [selectedTexture, setSelectedTexture] = useState(
    textures[0] ?? (product?.variants?.length ? '' : 'Straight'),
  )
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? 'Light Grey')

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleAddToCart = () => {
    const selectedVariant = product.variants?.find(
      (v: any) => v.texture === selectedTexture && v.color === selectedColor,
    )

    if (!selectedVariant) {
      alert('Selected variant not available.')
      return
    }

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      price: selectedVariant.price ?? product.price,
      image: product.image || product.images?.[0] || '/images/placeholder.jpg',
      quantity,
      color: selectedColor,
      texture: selectedTexture,
      length: selectedVariant.length,
    })
  }

  const selectClass =
    'h-12 rounded-xl border border-[#333333] bg-[#1A1A1A] px-4 text-sm text-white outline-none transition-colors hover:border-[#D4D4D4]/40 focus:border-[#D4D4D4]/40 cursor-pointer'

  return (
    <div
      className={`fixed bottom-0 left-0 w-full z-60 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        showBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="border-t border-[#2A2A2A] bg-[#121212]/95 backdrop-blur-2xl shadow-[0_-12px_48px_rgba(0,0,0,0.7)]">
        <div className="max-w-400 mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-5">

            {/* Product Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="relative w-16 h-16 md:w-19 md:h-19 rounded-xl overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] shrink-0">
                <Image
                  src={product.image || product.images?.[0] || '/images/placeholder.jpg'}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8A8A8A] mb-1.5">
                  Premium Hair Collection
                </p>
                <h3 className="font-cormorant text-lg md:text-2xl text-white tracking-tight truncate">
                  {product.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-base md:text-lg font-semibold text-white">
                    ₹{product.price?.toLocaleString?.('en-IN') ?? product.price}
                  </span>
                  {product.comparePrice && (
                    <span className="line-through text-[#555555] text-sm">
                      ₹{Number(product.comparePrice).toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="hidden sm:inline-flex items-center rounded-full border border-[#D4D4D4]/20 text-[#D4D4D4] text-[10px] uppercase tracking-widest px-3 py-1">
                    Best Seller
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-3">

              {/* Texture */}
              {textures.length > 0 && (
                <select
                  value={selectedTexture}
                  onChange={(e) => setSelectedTexture(e.target.value)}
                  className={selectClass}
                >
                  {textures.map((t) => (
                    <option key={t} value={t} className="bg-[#1A1A1A]">{t}</option>
                  ))}
                </select>
              )}

              {/* Color */}
              {colors.length > 0 && (
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className={selectClass}
                >
                  {colors.map((c) => (
                    <option key={c} value={c} className="bg-[#1A1A1A]">{c}</option>
                  ))}
                </select>
              )}

              {/* Quantity */}
              <div className="flex items-center border border-brand-border rounded-xl overflow-hidden bg-[#1A1A1A]">
                <button
                  onClick={() => setQuantity((p) => Math.max(1, p - 1))}
                  className="w-12 h-12 flex items-center justify-center text-[#8A8A8A] hover:bg-[#2A2A2A] hover:text-white transition-all"
                >
                  <Minus size={14} strokeWidth={1.5} />
                </button>
                <span className="w-10 text-center text-sm font-medium text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((p) => p + 1)}
                  className="w-12 h-12 flex items-center justify-center text-[#8A8A8A] hover:bg-[#2A2A2A] hover:text-white transition-all"
                >
                  <Plus size={14} strokeWidth={1.5} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="group luxury-button h-12 gap-2.5 flex items-center px-8"
              >
                <ShoppingBag size={15} className="transition-transform duration-300 group-hover:scale-110" strokeWidth={1.7} />
                Add To Cart
              </button>
            </div>

            {/* Mobile CTA */}
            <div className="lg:hidden shrink-0">
              <button
                onClick={handleAddToCart}
                className="luxury-button h-11 px-5 text-xs"
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
