'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ArrowUpRight } from 'lucide-react'
import { useRef, useCallback } from 'react'
import { gsap } from '@/lib/gsap'
import { useWishlist } from '@/lib/useWishlist'

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ProductCard({ product }: { product: any }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const heartRef = useRef<HTMLButtonElement>(null)
  const { wishlisted, toggle } = useWishlist(product.id ?? product.slug ?? '')

  const discount =
    product.comparePrice && product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      if (heartRef.current) {
        gsap.timeline()
          .to(heartRef.current, { scale: 0.75, duration: 0.1, ease: 'power2.in' })
          .to(heartRef.current, { scale: 1.25, duration: 0.2, ease: 'back.out(3)' })
          .to(heartRef.current, { scale: 1, duration: 0.15, ease: 'power2.out' })
      }
      toggle(e)
    },
    [toggle],
  )

  return (
    <Link href={`/product/${product.slug}`} className="group block" tabIndex={0}>
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] transition-all duration-500 group-hover:border-[#D4D4D4]/40 group-hover:shadow-[0_20px_56px_rgba(0,0,0,0.6)]"
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={product.image || product.images?.[0]?.url || '/images/placeholder.png'}
            alt={product.title}
            fill
            sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 30vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-[#121212]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Quick-view */}
          <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#121212]/80 backdrop-blur-md border border-[#333333] flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>

          {/* Wishlist */}
          <button
            ref={heartRef}
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-[#121212]/80 backdrop-blur-md border border-[#333333] flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:border-[#D4D4D4]"
          >
            <Heart
              className={`w-3.75 h-3.75 transition-colors ${
                wishlisted ? 'fill-[#D4D4D4] text-[#D4D4D4]' : 'text-[#8A8A8A]'
              }`}
            />
          </button>

          {/* Badges */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
            {product.badge && (
              <span className="luxury-badge text-[0.6rem]">{product.badge}</span>
            )}
            {discount !== null && discount > 0 && (
              <span className="luxury-badge text-[0.6rem] border-[#D4D4D4]/30 text-[#D4D4D4]">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 pb-5">
          {product.collection && (
            <p className="text-primary-600 text-[0.6rem] uppercase tracking-[0.22em] mb-1.5 font-inter">
              {product.collection}
            </p>
          )}
          <h3 className="text-[#F5F5F5] text-[0.9375rem] font-medium leading-snug tracking-tight mb-3 group-hover:text-white transition-colors duration-200 font-inter line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-white text-[1rem] font-semibold font-inter">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {product.comparePrice && (
                <span className="text-primary-600 text-sm line-through font-inter">
                  ₹{Number(product.comparePrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.reviews > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[#D4D4D4] text-xs">★</span>
                <span className="text-[#8A8A8A] text-xs font-inter">({product.reviews})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
