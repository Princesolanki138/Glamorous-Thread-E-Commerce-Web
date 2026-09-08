import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getCollections() {
  return prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getProducts({ collectionSlug }: { collectionSlug?: string } = {}) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(collectionSlug ? { collection: { slug: collectionSlug } } : {}),
    },
    include: {
      collection: true,
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      _count: { select: { reviews: { where: { approved: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return products.map((product) => ({
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: product.price,
    comparePrice: product.comparePrice,
    image: product.images[0]?.url,
    collection: product.collection.title,
    reviews: product._count.reviews,
  }))
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      collection: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      },
    },
  })

  if (!product) return null

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    shortDesc: product.shortDesc,
    // Supplier spec table is free-form JSON; narrow it to a string map for the UI.
    specs:
      product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs)
        ? (Object.fromEntries(
            Object.entries(product.specs).map(([k, v]) => [k, String(v)]),
          ) as Record<string, string>)
        : null,
    price: product.price,
    comparePrice: product.comparePrice,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    collectionId: product.collectionId,
    collection: product.collection.title,
    collectionSlug: product.collection.slug,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt ?? product.title })),
    image: product.images[0]?.url,
    variants: product.variants.map((v) => ({
      id: v.id,
      color: v.color,
      texture: v.texture,
      length: v.length,
      price: v.price,
      comparePrice: v.comparePrice,
      stock: v.stock,
    })),
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      userName: r.user.name || 'Verified Buyer',
    })),
  }
}

/* ──────────────────────────────────────────────────────────────────
   Storefront card data
   Shared shape for the product grids on the homepage and product page.
   ────────────────────────────────────────────────────────────────── */

export type StorefrontCardProduct = {
  id: string
  title: string
  slug: string
  price: number
  comparePrice: number | null
  image: string
  collection: string
  reviews: number
  rating: number | null
  badge: string | null
}

// Only products that actually have an image are eligible for the curated
// grids — a missing image would render a broken tile in a showcase section.
const cardWhere = { isActive: true, images: { some: {} } } as const

const cardSelect = {
  id: true,
  title: true,
  slug: true,
  price: true,
  comparePrice: true,
  featured: true,
  createdAt: true,
  collection: { select: { title: true } },
  images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
} as const

type CardRow = {
  id: string
  title: string
  slug: string
  price: number
  comparePrice: number | null
  featured: boolean
  createdAt: Date
  collection: { title: string }
  images: { url: string }[]
}

const NEW_IN_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

function badgeFor(product: CardRow): string | null {
  if (product.featured) return 'Bestseller'
  if (Date.now() - product.createdAt.getTime() < NEW_IN_WINDOW_MS) return 'New In'
  return null
}

/** Attaches approved-review count + average rating in a single extra query. */
async function withReviewStats(products: CardRow[]): Promise<StorefrontCardProduct[]> {
  if (products.length === 0) return []

  const stats = await prisma.review.groupBy({
    by: ['productId'],
    where: { approved: true, productId: { in: products.map((p) => p.id) } },
    _avg: { rating: true },
    _count: { _all: true },
  })
  const byProduct = new Map(stats.map((s) => [s.productId, s]))

  return products.map((product) => {
    const stat = byProduct.get(product.id)
    const avg = stat?._avg.rating ?? null

    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      comparePrice: product.comparePrice,
      image: product.images[0].url,
      collection: product.collection.title,
      reviews: stat?._count._all ?? 0,
      rating: avg === null ? null : Math.round(avg * 10) / 10,
      badge: badgeFor(product),
    }
  })
}

/** Homepage "Our Best Sellers" grid. Admin-flagged featured products first. */
export const getBestSellers = unstable_cache(
  async (limit = 8): Promise<StorefrontCardProduct[]> => {
    const products = await prisma.product.findMany({
      where: cardWhere,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      select: cardSelect,
    })
    return withReviewStats(products)
  },
  ['storefront-best-sellers'],
  { revalidate: 60, tags: ['products'] },
)

export type StorefrontDemo = {
  id: string
  title: string
  videoUrl: string
  posterUrl: string | null
  collectionSlug: string
}

/**
 * Homepage "Product Demo" carousel. Only active demos whose collection is also
 * active, so hiding a collection hides its clips too.
 */
export const getProductDemos = unstable_cache(
  async (): Promise<StorefrontDemo[]> => {
    const demos = await prisma.productDemo.findMany({
      where: { isActive: true, collection: { isActive: true } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        videoUrl: true,
        posterUrl: true,
        collection: { select: { slug: true } },
      },
    })

    return demos.map((d) => ({
      id: d.id,
      title: d.title,
      videoUrl: d.videoUrl,
      posterUrl: d.posterUrl,
      collectionSlug: d.collection.slug,
    }))
  },
  ['storefront-product-demos'],
  { revalidate: 60, tags: ['product-demos'] },
)

/**
 * Product page "You May Also Like".
 * Prefers other products in the same collection, then tops up from the rest of
 * the catalogue so the grid is never half-empty on a thin collection.
 */
export const getRelatedProducts = unstable_cache(
  async (
    productId: string,
    collectionId: string,
    limit = 4,
  ): Promise<StorefrontCardProduct[]> => {
    const sameCollection = await prisma.product.findMany({
      where: { ...cardWhere, collectionId, id: { not: productId } },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      select: cardSelect,
    })

    let picked: CardRow[] = sameCollection

    if (picked.length < limit) {
      const exclude = [productId, ...picked.map((p) => p.id)]
      const topUp = await prisma.product.findMany({
        where: { ...cardWhere, id: { notIn: exclude } },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        take: limit - picked.length,
        select: cardSelect,
      })
      picked = [...picked, ...topUp]
    }

    return withReviewStats(picked)
  },
  ['storefront-related-products'],
  { revalidate: 60, tags: ['products'] },
)

/* ──────────────────────────────────────────────────────────────────
   Homepage testimonials — real approved reviews
   ────────────────────────────────────────────────────────────────── */

export type StorefrontTestimonial = {
  id: string
  name: string
  role: string
  quote: string
  image: string
  rating: number
}

export const getTestimonials = unstable_cache(
  async (limit = 3): Promise<StorefrontTestimonial[]> => {
    const reviews = await prisma.review.findMany({
      where: { approved: true, product: { isActive: true, images: { some: {} } } },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        user: { select: { name: true, city: true } },
        product: {
          select: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
          },
        },
      },
    })

    return reviews.map((review) => ({
      id: review.id,
      name: review.user.name?.trim() || 'Verified Customer',
      role: review.user.city
        ? `Verified Customer \u00B7 ${review.user.city}`
        : 'Verified Customer',
      quote: review.comment,
      image: review.product.images[0].url,
      rating: review.rating,
    }))
  },
  ['storefront-testimonials'],
  { revalidate: 60, tags: ['reviews'] },
)
