import type { Metadata } from 'next'
import Header from '@/component/layout/Header'
import { Footer } from '@/component/layout/Footer'
import ProductCard from '@/component/products/ProductCard'
import { getCollections, getProducts } from '@/lib/products'

export const metadata: Metadata = {
  title: 'The Collection',
  description: 'Shop the full range of premium 100% human hair wigs, extensions and toppers.',
}

export default async function CollectionPage() {
  const [collections, products] = await Promise.all([getCollections(), getProducts()])

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <Header />

      <main className="pt-40 md:pt-48 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="section-label text-[#D4D4D4] mb-5 justify-center">Shop Everything</p>
            <h1 className="font-cormorant text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1.05]">
              The Collection
            </h1>
            <p className="text-[#8A8A8A] text-sm md:text-base mt-5 max-w-xl mx-auto">
              {products.length} product{products.length !== 1 ? 's' : ''} crafted with premium 100% human hair.
            </p>
          </div>

          {/* Collection filter chips */}
          {collections.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-14">
              <span className="px-5 py-2.5 rounded-full text-xs uppercase tracking-widest border border-[#D4D4D4]/40 bg-[#D4D4D4]/10 text-[#D4D4D4]">
                All
              </span>
              {collections.map((c) => (
                <a
                  key={c.slug}
                  href={`/collection/${c.slug}`}
                  className="px-5 py-2.5 rounded-full text-xs uppercase tracking-widest border border-[#2A2A2A] bg-[#1A1A1A] text-[#8A8A8A] hover:text-white hover:border-[#D4D4D4]/40 transition-all"
                >
                  {c.title}
                </a>
              ))}
            </div>
          )}

          {/* Grid */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-[#2A2A2A] bg-[#111111]">
              <p className="text-[#555555] text-sm">No products available right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
