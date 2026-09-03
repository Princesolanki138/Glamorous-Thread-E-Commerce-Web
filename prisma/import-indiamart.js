/**
 * Replaces the entire catalogue with the company's IndiaMART listing.
 *
 *   node prisma/download-images.js      # first: pull the photos into /public
 *   node prisma/import-indiamart.js --confirm
 *
 * Destructive: every Collection and Product is deleted. Cascades mean product
 * images, variants, wishlist entries, reviews and inventory logs go with them.
 * Orders are preserved - OrderItem.variantId is nullable with onDelete: SetNull
 * and each line keeps its own title/price/image snapshot.
 *
 * The existing catalogue is written to prisma/backup-catalogue-<ts>.json first.
 */
require('dotenv/config')
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const { COLLECTIONS, PRODUCTS } = require('./indiamart-data')
const { localPathFor } = require('./download-images')

const prisma = new PrismaClient()

/** Products flagged featured on the storefront: the first two of each collection. */
function featuredSlugs() {
  const seen = new Map()
  const featured = new Set()
  for (const p of PRODUCTS) {
    const n = seen.get(p.collectionSlug) ?? 0
    if (n < 2) featured.add(p.slug)
    seen.set(p.collectionSlug, n + 1)
  }
  return featured
}

async function backup() {
  const data = {
    exportedAt: new Date().toISOString(),
    collections: await prisma.collection.findMany(),
    products: await prisma.product.findMany({ include: { images: true, variants: true } }),
  }
  const file = path.join(__dirname, `backup-catalogue-${Date.now()}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  return { file, collections: data.collections.length, products: data.products.length }
}

async function main() {
  if (!process.argv.includes('--confirm')) {
    console.error('Refusing to run without --confirm (this deletes every collection and product).')
    process.exit(1)
  }

  const before = {
    collections: await prisma.collection.count(),
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    reviews: await prisma.review.count(),
    wishlist: await prisma.wishlist.count(),
  }
  console.log('BEFORE', JSON.stringify(before))

  const saved = await backup()
  console.log(`Backed up ${saved.collections} collections / ${saved.products} products -> ${path.basename(saved.file)}`)

  // Delete products first: cascades clear images, variants, reviews, wishlist and
  // inventory logs, and null out OrderItem.variantId without touching orders.
  const delProducts = await prisma.product.deleteMany({})
  const delCollections = await prisma.collection.deleteMany({})
  console.log(`Deleted ${delProducts.count} products, ${delCollections.count} collections`)

  // Recreate the catalogue.
  const collectionIdBySlug = new Map()
  for (const c of COLLECTIONS) {
    const created = await prisma.collection.create({
      data: {
        title: c.title,
        slug: c.slug,
        description: c.description,
        sortOrder: c.sortOrder,
        isActive: true,
        metaTitle: `${c.title} | Gemeria Hair`,
        metaDescription: c.description,
      },
    })
    collectionIdBySlug.set(c.slug, created.id)
  }
  console.log(`Created ${collectionIdBySlug.size} collections`)

  const featured = featuredSlugs()
  let productCount = 0
  let imageCount = 0

  for (const p of PRODUCTS) {
    const collectionId = collectionIdBySlug.get(p.collectionSlug)
    if (!collectionId) throw new Error(`Unknown collection slug: ${p.collectionSlug}`)

    const images = p.images.map((url, i) => ({
      url: localPathFor(p.slug, url, i),
      alt: `${p.title} — photo ${i + 1}`,
      sortOrder: i,
    }))

    await prisma.product.create({
      data: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        shortDesc: p.shortDesc ?? null,
        price: p.price,
        collectionId,
        featured: featured.has(p.slug),
        isActive: true,
        hairColor: p.hairColor ?? null,
        hairLength: p.hairLength ?? null,
        hairStyle: p.hairStyle ?? null,
        hairTexture: p.hairTexture ?? null,
        specs: p.specs ?? undefined,
        metaTitle: `${p.title} | Gemeria Hair`,
        metaDescription: p.shortDesc ?? p.description.slice(0, 155),
        images: { create: images },
        // One default variant per product so items are addable to the cart.
        variants: {
          create: [
            {
              color: p.hairColor ?? null,
              length: p.hairLength ?? null,
              texture: p.hairTexture ?? null,
              sku: `GT-${p.slug.toUpperCase()}`,
              stock: 10,
            },
          ],
        },
      },
    })

    productCount++
    imageCount += images.length
  }

  const after = {
    collections: await prisma.collection.count(),
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
    productImages: await prisma.productImage.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    reviews: await prisma.review.count(),
    wishlist: await prisma.wishlist.count(),
  }
  console.log(`Created ${productCount} products with ${imageCount} images`)
  console.log('AFTER', JSON.stringify(after))
}

main()
  .catch((e) => {
    console.error('IMPORT_FAILED', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
