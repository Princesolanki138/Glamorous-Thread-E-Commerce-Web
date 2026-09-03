import ProductCard from './ProductCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { StorefrontCardProduct } from '@/lib/products'

export default function RecommendedProducts({
  products,
}: {
  products: StorefrontCardProduct[]
}) {
  if (products.length === 0) return null

  return (
    <section className="bg-brand-bg py-24 md:py-32 overflow-hidden">
      <div className="max-w-400 mx-auto px-5 md:px-10 lg:px-16">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-16">
          <div className="max-w-3xl">
            <div className="section-label mb-6">Curated For You</div>
            <h2 className="font-cormorant text-4xl md:text-5xl text-white tracking-tight">
              You May Also <span className="gradient-text italic">Like</span>
            </h2>
            <p className="mt-5 text-[#8A8A8A] text-sm md:text-base leading-8">
              Handpicked premium hair essentials designed to complement your current
              selection and elevate your everyday look with effortless luxury.
            </p>
          </div>

          <Link
            href="/collection"
            className="hidden md:inline-flex items-center gap-3 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[#B8B8B8] hover:text-white transition-all duration-300 hover:gap-4"
          >
            Explore Collections
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="relative mt-20 rounded-4xl overflow-hidden bg-[#1A1A1A] border border-brand-border px-8 md:px-14 py-14 md:py-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4D4D4]/4 blur-3xl rounded-full pointer-events-none" />

          <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">
            <div className="max-w-2xl">
              <div className="section-label mb-6">Need Assistance?</div>
              <h3 className="font-cormorant text-3xl md:text-4xl text-white tracking-tight">
                Find Your Perfect Match
              </h3>
              <p className="mt-5 text-[#8A8A8A] text-sm md:text-base leading-8">
                Connect with our hair experts for personalized guidance on shades,
                textures, styling, and seamless blending.
              </p>
            </div>

            <button className="group w-fit luxury-button gap-3 flex items-center">
              Chat On WhatsApp
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
