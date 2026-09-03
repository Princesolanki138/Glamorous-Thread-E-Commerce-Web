'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { useWishlist } from '@/lib/useWishlist'
import ProductBreadcrumb from './ProductBreadcrumb'
import ProductPrice from './ProductPrice'
import ProductVariants from './ProductVariants'
import QuantitySelector from './QuantitySelector'
import AddToCartButton from './AddToCartButton'
import ProductAccordion from './ProductAccordion'

type ColorOption = { name: string; value: string }

export default function ProductInfo({ product }: { product: any }) {
  // Derive color options from variants (hook — must be at top, unconditionally)
  const colors: ColorOption[] = useMemo(() => {
    if (!product?.variants) return []
    const colorMap = new Map<string, ColorOption>()
    product.variants.forEach((v: any) => {
      colorMap.set(v.color, { name: v.color, value: v.colorCode || 'bg-gray-400' })
    })
    return Array.from(colorMap.values())
  }, [product])

  // Derive texture options
  const textures: string[] = useMemo(() => {
    if (!product?.variants) return []
    const textureSet = new Set<string>()
    product.variants.forEach((v: any) => { if (v.texture) textureSet.add(v.texture) })
    return Array.from(textureSet)
  }, [product])

  // Initialize state with first available option (no useEffect needed)
  const [selectedColor, setSelectedColor] = useState<ColorOption | undefined>(colors[0])
  const [selectedTexture, setSelectedTexture] = useState<string>(textures[0] || '')
  const [quantity, setQuantity] = useState(1)
  const heartRef = useRef<HTMLButtonElement>(null)
  const { wishlisted, toggle: toggleWishlist } = useWishlist(product?.id ?? '')

  // Derive the effective texture — auto-correct if selected texture is incompatible with color
  const effectiveTexture = useMemo(() => {
    if (!selectedColor) return selectedTexture
    const validVariants = product?.variants?.filter(
      (v: any) => v.color === selectedColor.name
    )
    if (!validVariants?.length) return selectedTexture
    const isValid = validVariants.some((v: any) => v.texture === selectedTexture)
    return isValid ? selectedTexture : (validVariants[0]?.texture || selectedTexture)
  }, [selectedColor, selectedTexture, product])

  // Find matched variant using corrected texture
  const selectedVariant = useMemo(() => {
    if (!selectedColor) return null
    return (
      product?.variants?.find(
        (v: any) => v.color === selectedColor.name && v.texture === effectiveTexture
      ) || null
    )
  }, [product, selectedColor, effectiveTexture])

  // Safety check — AFTER all hooks
  if (!product) return null

  const isVariantAvailable = !!selectedVariant
  const currentPrice = selectedVariant?.price ?? product.price

  return (
    <div className="lg:sticky top-28 h-fit">

      {/* Breadcrumb */}
      <ProductBreadcrumb product={product} />

      {/* Collection label */}
      <p className="uppercase tracking-[0.3em] text-xs text-[#9CA3AF] mt-8">
        {product.collection}
      </p>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mt-4">
        {product.title}
      </h1>

      {/* Description */}
      <p className="text-[#9CA3AF] text-sm md:text-base leading-7 mt-5 max-w-2xl">
        {product.shortDesc ||
          product.description ||
          'Crafted with premium-quality 100% human hair for a naturally seamless blend, lightweight comfort, and salon-finish styling.'}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-3 mt-5">
        <div className="flex text-sm text-[#BFC0C2] tracking-wide">★★★★★</div>
        <span className="text-sm text-[#9CA3AF]">2,000+ happy customers</span>
      </div>

      {/* Price */}
      <div className="mt-10">
        <ProductPrice
          product={{ ...product, price: currentPrice }}
          selectedVariant={selectedVariant}
        />
      </div>

      <div className="border-t border-[#262626] my-8" />

      {/* Variants + Quantity */}
      <div className="space-y-7">
        <ProductVariants
          colors={colors}
          textures={textures}
          selectedColor={selectedColor}
          selectedTexture={effectiveTexture}
          onSelectColor={setSelectedColor}
          onSelectTexture={setSelectedTexture}
        />
        <QuantitySelector
          quantity={quantity}
          onDecrease={() => setQuantity((p) => Math.max(1, p - 1))}
          onIncrease={() => setQuantity((p) => p + 1)}
        />
      </div>

      {/* Variant unavailable warning */}
      {!isVariantAvailable && (
        <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">Selected variant is unavailable.</p>
        </div>
      )}

      {/* Add to Cart + Wishlist */}
      <div className="mt-8 flex gap-3">
        <div className="flex-1">
        <AddToCartButton
          product={product}
          selectedVariant={selectedVariant}
          quantity={quantity}
          color={selectedColor?.name}
          texture={effectiveTexture}
          length={selectedVariant?.length}
        />
        </div>
        <button
          ref={heartRef}
          onClick={(e) => {
            if (heartRef.current) {
              gsap.timeline()
                .to(heartRef.current, { scale: 0.8, duration: 0.1, ease: 'power2.in' })
                .to(heartRef.current, { scale: 1.3, duration: 0.2, ease: 'back.out(3)' })
                .to(heartRef.current, { scale: 1, duration: 0.15, ease: 'power2.out' })
            }
            toggleWishlist(e)
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-300 shrink-0 ${
            wishlisted
              ? 'bg-[#D4D4D4]/10 border-[#D4D4D4]/40 text-[#D4D4D4]'
              : 'bg-[#1A1A1A] border-brand-border text-[#8A8A8A] hover:border-[#D4D4D4]/40 hover:text-[#D4D4D4]'
          }`}
        >
          <Heart
            className="w-5 h-5"
            fill={wishlisted ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Accordions */}
      <div className="mt-12">
        <ProductAccordion title="Description" content={product.description || product.shortDesc} />
        <ProductAccordion
          title="Additional Details"
          content={product.shortDesc || product.description}
          items={product.specs}
        />
        <ProductAccordion title="Shipping & Returns" />
      </div>
    </div>
  )
}
