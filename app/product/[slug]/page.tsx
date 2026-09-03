import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/component/layout/Header'
import { Footer } from '@/component/layout/Footer'
import ProductGallery from '@/component/products/ProductGallery'
import ProductInfo from '@/component/products/ProductInfo'
import StickyCartBar from '@/component/products/StickyCartBar'
import CustomerReviews from '@/component/products/CustomerReviews'
import RecommendedProducts from '@/component/products/RecommendedProducts'
// import RecentlyViewed from '@/component/products/RecentlyViewed'
import TrustBadges from '@/component/products/TrustBadges'
import { getProductBySlug, getRelatedProducts } from '@/lib/products'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  return {
    title: product.metaTitle || product.title,
    description: product.metaDescription || product.shortDesc || undefined,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const relatedProducts = await getRelatedProducts(product.id, product.collectionId, 4)

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <Header />

      <main className="pt-36 md:pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <ProductGallery product={product} title={product.title} />
            <ProductInfo product={product} />
          </div>
        </div>
      </main>

      <TrustBadges />
      <RecommendedProducts products={relatedProducts} />
      <CustomerReviews product={product} />
      {/* <RecentlyViewed /> */}

      <StickyCartBar product={product} />

      <Footer />
    </div>
  )
}
