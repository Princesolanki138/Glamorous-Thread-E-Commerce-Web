'use client'

import React, { useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { StorefrontCardProduct } from '@/lib/products'

gsap.registerPlugin(ScrollTrigger)

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`

function ProductTile({ product, index }: { product: StorefrontCardProduct; index: number }) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bs-card"
      style={{ opacity: 0 }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] transition-all duration-500 group-hover:border-[#D4D4D4]/40 group-hover:shadow-[0_24px_60px_rgba(0,0,0,0.7)]">

        {/* Image */}
        <div className={`relative overflow-hidden ${index === 0 ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}>
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width:640px) 90vw, (max-width:1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Arrow */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-[#333333] flex items-center justify-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Badges */}
          <div className="absolute bottom-4 left-4 flex gap-1.5">
            {product.badge && (
              <span className="luxury-badge text-[0.6rem]">{product.badge}</span>
            )}
            {discount > 0 && (
              <span className="luxury-badge text-[0.6rem] text-[#D4D4D4] border-[#D4D4D4]/25">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 pb-5">
          <p className="text-[#5C5C5C] text-[0.6rem] uppercase tracking-[0.22em] mb-1.5 font-inter">
            {product.collection}
          </p>
          <h3 className="text-[#F5F5F5] text-[0.9rem] font-medium leading-snug mb-3 group-hover:text-white transition-colors font-inter line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-white font-semibold text-[0.9375rem] font-inter">{inr(product.price)}</span>
              {product.comparePrice && (
                <span className="text-[#5C5C5C] text-xs line-through font-inter">{inr(product.comparePrice)}</span>
              )}
            </div>
            {product.rating !== null && (
              <div className="flex items-center gap-1">
                <span className="text-[#D4D4D4] text-xs">★</span>
                <span className="text-[#8A8A8A] text-xs font-inter">{product.rating} ({product.reviews})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export const BestSellers: React.FC<{ products: StorefrontCardProduct[] }> = ({ products }) => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.fromTo('.bs-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: '.bs-header', start: 'top 85%', once: true },
        }
      )

      // Cards stagger
      gsap.fromTo('.bs-card',
        { opacity: 0, y: 64 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: '.bs-grid', start: 'top 80%', once: true },
        }
      )

      // CTA
      gsap.fromTo('.bs-cta',
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: '.bs-cta', start: 'top 88%', once: true },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  if (products.length === 0) return null

  return (
    <section ref={sectionRef} className="py-28 bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="bs-header flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16" style={{ opacity: 0 }}>
          <div>
            <p className="section-label text-[#D4D4D4] mb-5">Our Best Sellers</p>
            <h2 className="font-cormorant text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1.05]">
              The Collection
              <span className="block gradient-text">They Love</span>
            </h2>
          </div>
          <Link href="/collection" className="luxury-button-outline self-start md:self-auto whitespace-nowrap">
            View All <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>

        {/* Grid — featured + 3 smaller */}
        <div className="bs-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <div key={product.slug} className={i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}>
              <ProductTile product={product} index={i} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bs-cta text-center mt-16 pt-12 border-t border-[#222222]" style={{ opacity: 0 }}>
          <p className="text-[#8A8A8A] mb-6 text-sm font-inter tracking-wide">
            Loved by over 200,000 women across India
          </p>
          <Link href="/collection" className="luxury-button">
            Explore Full Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
