import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/component/layout/Header'
import { Footer } from '@/component/layout/Footer'
import ProductCard from '@/component/products/ProductCard'
import { getCollections, getProducts } from '@/lib/products'

function titleCase(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const collections = await getCollections()
  const collection = collections.find((c) => c.slug === slug)
  const title = collection?.title || titleCase(slug)
  return {
    title,
    description: collection?.description || `Shop ${title} at Glamorous Thread.`,
  }
}

export default async function CollectionBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collections = await getCollections()
  const collection = collections.find((c) => c.slug === slug)
  const products = await getProducts({ collectionSlug: collection?.slug })

  const heading = collection?.title || titleCase(slug)

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <Header />

      <main className="pt-40 md:pt-48 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="section-label text-[#D4D4D4] mb-5 justify-center">Collection</p>
            <h1 className="font-cormorant text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1.05]">
              {heading}
            </h1>
            {collection?.description && (
              <p className="text-[#8A8A8A] text-sm md:text-base mt-5 max-w-xl mx-auto">
                {collection.description}
              </p>
            )}
          </div>

          {/* Collection filter chips */}
          {collections.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-14">
              <Link
                href="/collection"
                className="px-5 py-2.5 rounded-full text-xs uppercase tracking-widest border border-[#2A2A2A] bg-[#1A1A1A] text-[#8A8A8A] hover:text-white hover:border-[#D4D4D4]/40 transition-all"
              >
                All
              </Link>
              {collections.map((c) => (
                <Link
                  key={c.slug}
                  href={`/collection/${c.slug}`}
                  className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest border transition-all ${
                    c.slug === collection?.slug
                      ? 'border-[#D4D4D4]/40 bg-[#D4D4D4]/10 text-[#D4D4D4]'
                      : 'border-[#2A2A2A] bg-[#1A1A1A] text-[#8A8A8A] hover:text-white hover:border-[#D4D4D4]/40'
                  }`}
                >
                  {c.title}
                </Link>
              ))}
            </div>
          )}

          {/* Grid */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-[#2A2A2A] bg-[#111111]">
              <p className="text-[#555555] text-sm mb-6">No products in this collection yet.</p>
              <Link href="/collection" className="luxury-button-outline text-sm">
                Browse Full Collection
              </Link>
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
