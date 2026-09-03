const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const img = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`

// ─── Collections ─────────────────────────────────────────────────────────────
const COLLECTIONS = [
  {
    title: 'Wigs',
    slug: 'wigs',
    description: 'Full head coverage wigs in 100% human hair for every occasion.',
  },
  {
    title: 'Hair Extensions',
    slug: 'hair-extensions',
    description: 'Premium 100% human hair extensions for added length and volume.',
  },
  {
    title: 'Hair Toppers',
    slug: 'hair-toppers',
    description: 'Crown-coverage toppers crafted for thinning and fine hair.',
  },
  {
    title: 'Clip-In Extensions',
    slug: 'clip-in-extensions',
    description: 'Instant volume and length you can clip in under 5 minutes.',
  },
  {
    title: 'Tape-In Extensions',
    slug: 'tape-in-extensions',
    description: 'Seamless, ultra-thin tape-in extensions that last 6–8 weeks.',
  },
]

// ─── Products ─────────────────────────────────────────────────────────────────
const PRODUCTS = [
  // ── WIGS ──────────────────────────────────────────────────────────────────
  {
    title:       'Silky Straight Full Wig',
    slug:        'silky-straight-full-wig',
    collection:  'wigs',
    price:        4999,
    comparePrice: 6999,
    featured:     true,
    shortDesc:   'Ultra-smooth 100% human hair full wig. Natural-looking and heat-friendly.',
    description: 'The Silky Straight Full Wig is crafted from premium 100% human hair, offering a seamless, natural look. Its silky-smooth texture mimics natural hair perfectly. Heat-styling friendly up to 180°C. Adjustable cap fits most head sizes comfortably. With proper care it lasts 1–2 years.',
    hairStyle:   'Straight',
    hairColor:   'Natural Black',
    hairLength:  '18 inch',
    hairTexture: 'Silky',
    imageId:     '6923222',
    variants: [
      { color: 'Natural Black', length: '16 inch', stock: 12, sku: 'SSW-NBK-16', price: 4999, comparePrice: 6999 },
      { color: 'Natural Black', length: '18 inch', stock: 8,  sku: 'SSW-NBK-18', price: 5499, comparePrice: 7499 },
      { color: 'Dark Brown',    length: '16 inch', stock: 6,  sku: 'SSW-DBR-16', price: 4999, comparePrice: 6999 },
    ],
  },
  {
    title:       'Body Wave Lace Front Wig',
    slug:        'body-wave-lace-front-wig',
    collection:  'wigs',
    price:        7499,
    comparePrice: 9999,
    featured:     false,
    shortDesc:   'Gorgeous body wave lace front wig with a natural-looking hairline.',
    description: 'The Body Wave Lace Front Wig features a transparent lace front for the most realistic hairline. Made from 100% virgin human hair with a beautiful body wave pattern that holds its shape wash after wash. Pre-plucked hairline for a ready-to-wear finish.',
    hairStyle:   'Body Wave',
    hairColor:   'Natural Black',
    hairLength:  '20 inch',
    hairTexture: 'Wavy',
    imageId:     '6923452',
    variants: [
      { color: 'Natural Black', length: '18 inch', stock: 5, sku: 'BWL-NBK-18', price: 7499,  comparePrice: 9999  },
      { color: 'Natural Black', length: '20 inch', stock: 7, sku: 'BWL-NBK-20', price: 8499,  comparePrice: 10999 },
      { color: 'Dark Brown',    length: '20 inch', stock: 4, sku: 'BWL-DBR-20', price: 8499,  comparePrice: 10999 },
    ],
  },

  // ── CLIP-IN EXTENSIONS ────────────────────────────────────────────────────
  {
    title:       'Natural Black Clip-In Extensions',
    slug:        'natural-black-clip-in-extensions',
    collection:  'clip-in-extensions',
    price:        2999,
    comparePrice: 3999,
    featured:     false,
    shortDesc:   '7-piece set, 120g real human hair. Clips in under 5 minutes.',
    description: 'Our Natural Black Clip-In Extensions are the easiest way to add instant length and volume. The 7-piece 120g set is made from 100% real human hair, clips in under 5 minutes, and blends seamlessly with your natural hair. Removable, reusable, and perfect for everyday or special occasions.',
    hairStyle:   'Straight',
    hairColor:   'Jet Black',
    hairLength:  '18 inch',
    hairTexture: 'Silky',
    imageId:     '10224830',
    variants: [
      { color: 'Jet Black', length: '16 inch', stock: 20, sku: 'CI-JBK-16', price: 2999, comparePrice: 3999 },
      { color: 'Jet Black', length: '18 inch', stock: 15, sku: 'CI-JBK-18', price: 3299, comparePrice: 4299 },
      { color: 'Jet Black', length: '20 inch', stock: 10, sku: 'CI-JBK-20', price: 3599, comparePrice: 4599 },
    ],
  },
  {
    title:       'Chocolate Brown Clip-In Extensions',
    slug:        'chocolate-brown-clip-in-extensions',
    collection:  'clip-in-extensions',
    price:        3499,
    comparePrice: 4499,
    featured:     false,
    shortDesc:   'Warm chocolate brown 7-piece clip-in set. 120g real human hair.',
    description: 'The Chocolate Brown Clip-In Extensions bring warm, rich dimension to your hair. 7-piece 120g set made from 100% human hair. The warm chocolate tone blends beautifully on brunettes and dark-haired women. Easy to clip in and remove at home without any tools.',
    hairStyle:   'Straight',
    hairColor:   'Chocolate Brown',
    hairLength:  '18 inch',
    hairTexture: 'Silky',
    imageId:     '14730864',
    variants: [
      { color: 'Chocolate Brown', length: '16 inch', stock: 18, sku: 'CI-CHB-16', price: 3499, comparePrice: 4499 },
      { color: 'Chocolate Brown', length: '18 inch', stock: 12, sku: 'CI-CHB-18', price: 3799, comparePrice: 4799 },
      { color: 'Dark Brown',      length: '18 inch', stock: 8,  sku: 'CI-DKB-18', price: 3699, comparePrice: 4699 },
    ],
  },

  // ── TAPE-IN EXTENSIONS ────────────────────────────────────────────────────
  {
    title:       'Jet Black Tape-In Extensions',
    slug:        'jet-black-tape-in-extensions',
    collection:  'tape-in-extensions',
    price:        5999,
    comparePrice: 7999,
    featured:     false,
    shortDesc:   '20-piece set. Ultra-thin invisible bonds. Lasts 6–8 weeks.',
    description: 'Our Jet Black Tape-In Extensions use ultra-thin adhesive tabs that are virtually invisible once applied. 20-piece set of 100% human hair that lasts 6–8 weeks before re-taping. Completely heat-friendly and reusable up to 3 times. Professional salon application recommended.',
    hairStyle:   'Straight',
    hairColor:   'Jet Black',
    hairLength:  '20 inch',
    hairTexture: 'Silky',
    imageId:     '14730875',
    variants: [
      { color: 'Jet Black', length: '18 inch', stock: 10, sku: 'TI-JBK-18', price: 5999, comparePrice: 7999 },
      { color: 'Jet Black', length: '20 inch', stock: 8,  sku: 'TI-JBK-20', price: 6499, comparePrice: 8499 },
      { color: 'Jet Black', length: '22 inch', stock: 5,  sku: 'TI-JBK-22', price: 6999, comparePrice: 8999 },
    ],
  },
  {
    title:       'Dark Brown Wavy Tape-In Extensions',
    slug:        'dark-brown-wavy-tape-in-extensions',
    collection:  'tape-in-extensions',
    price:        6499,
    comparePrice: 8499,
    featured:     false,
    shortDesc:   'Beautiful wavy dark brown tape-ins. Natural movement and full volume.',
    description: 'Dark Brown Wavy Tape-In Extensions add stunning waves and natural movement. 20-piece set of 100% human hair. The wavy texture blends naturally with wavy to straight hair types. Adhesive tabs are strong, flexible, and gentle on natural hair.',
    hairStyle:   'Wavy',
    hairColor:   'Dark Brown',
    hairLength:  '20 inch',
    hairTexture: 'Wavy',
    imageId:     '14730877',
    variants: [
      { color: 'Dark Brown',   length: '18 inch', stock: 9, sku: 'TI-DBW-18', price: 6499, comparePrice: 8499 },
      { color: 'Dark Brown',   length: '20 inch', stock: 6, sku: 'TI-DBW-20', price: 6999, comparePrice: 8999 },
      { color: 'Medium Brown', length: '20 inch', stock: 5, sku: 'TI-MBW-20', price: 6999, comparePrice: 8999 },
    ],
  },

  // ── HAIR TOPPERS ──────────────────────────────────────────────────────────
  {
    title:       'Crown Volume Hair Topper',
    slug:        'crown-volume-hair-topper',
    collection:  'hair-toppers',
    price:        8999,
    comparePrice: 11999,
    featured:     true,
    shortDesc:   'Add instant crown volume. Perfect for thinning hair at the top.',
    description: 'The Crown Volume Hair Topper is designed to cover thinning at the crown and part line. Made from 100% human hair for a seamless, natural blend. Features a monofilament base for a natural scalp appearance and a 4-clip attachment system for secure all-day hold.',
    hairStyle:   'Straight',
    hairColor:   'Natural Black',
    hairLength:  '14 inch',
    hairTexture: 'Silky',
    imageId:     '6923241',
    variants: [
      { color: 'Natural Black', length: '12 inch', stock: 8, sku: 'HT-NBK-12', price: 8999,  comparePrice: 11999 },
      { color: 'Natural Black', length: '14 inch', stock: 6, sku: 'HT-NBK-14', price: 9499,  comparePrice: 12999 },
      { color: 'Dark Brown',    length: '12 inch', stock: 5, sku: 'HT-DBR-12', price: 8999,  comparePrice: 11999 },
    ],
  },
  {
    title:       'Full Coverage Hair Topper',
    slug:        'full-coverage-hair-topper',
    collection:  'hair-toppers',
    price:        9499,
    comparePrice: 12999,
    featured:     false,
    shortDesc:   'Wider base, fuller coverage. Ideal for moderate-to-advanced thinning.',
    description: 'The Full Coverage Hair Topper provides wide-base coverage for moderate to advanced hair thinning. The 5×5 inch base covers more of the scalp for exceptional security. Built with 100% remy human hair and a lace mono base. 6-clip system for all-day comfort and security.',
    hairStyle:   'Straight',
    hairColor:   'Natural Black',
    hairLength:  '16 inch',
    hairTexture: 'Silky',
    imageId:     '6923225',
    variants: [
      { color: 'Natural Black', length: '14 inch', stock: 7, sku: 'FC-NBK-14', price: 9499,  comparePrice: 12999 },
      { color: 'Natural Black', length: '16 inch', stock: 5, sku: 'FC-NBK-16', price: 10499, comparePrice: 13999 },
      { color: 'Dark Brown',    length: '14 inch', stock: 4, sku: 'FC-DBR-14', price: 9499,  comparePrice: 12999 },
    ],
  },

  // ── HAIR EXTENSIONS ───────────────────────────────────────────────────────
  {
    title:       '22 Inch Straight Extensions Bundle',
    slug:        '22-inch-straight-extensions-bundle',
    collection:  'hair-extensions',
    price:        4499,
    comparePrice: 5999,
    featured:     false,
    shortDesc:   'Extra-long 22 inch 100% human hair. Adds dramatic length instantly.',
    description: '22 Inch Straight Extensions Bundle gives you the long, flowing hair you have always wanted. Full bundle of 100% human hair that blends naturally with your own. Heat-friendly up to 180°C. Thick from root to tip for a luscious finish. Double-drawn quality — no thin ends.',
    hairStyle:   'Straight',
    hairColor:   'Natural Black',
    hairLength:  '22 inch',
    hairTexture: 'Silky',
    imageId:     '14730876',
    variants: [
      { color: 'Natural Black', length: '22 inch', stock: 14, sku: 'EX-NBK-22', price: 4499, comparePrice: 5999 },
      { color: 'Dark Brown',    length: '22 inch', stock: 10, sku: 'EX-DBR-22', price: 4499, comparePrice: 5999 },
      { color: 'Jet Black',     length: '22 inch', stock: 8,  sku: 'EX-JBK-22', price: 4499, comparePrice: 5999 },
    ],
  },
  {
    title:       'Wavy Hair Extensions Bundle',
    slug:        'wavy-hair-extensions-bundle',
    collection:  'hair-extensions',
    price:        5299,
    comparePrice: 6999,
    featured:     true,
    shortDesc:   'Gorgeous natural waves. Full bundle for volume and body.',
    description: 'The Wavy Hair Extensions Bundle brings beautiful, natural-looking waves. Made from 100% unprocessed human hair with a natural wave pattern that holds beautifully. No daily styling required — the waves maintain their shape. Tangle-free and easy to maintain.',
    hairStyle:   'Wavy',
    hairColor:   'Natural Black',
    hairLength:  '20 inch',
    hairTexture: 'Wavy',
    imageId:     '14730865',
    variants: [
      { color: 'Natural Black', length: '18 inch', stock: 11, sku: 'EXW-NBK-18', price: 5299, comparePrice: 6999 },
      { color: 'Natural Black', length: '20 inch', stock: 9,  sku: 'EXW-NBK-20', price: 5799, comparePrice: 7499 },
      { color: 'Dark Brown',    length: '20 inch', stock: 6,  sku: 'EXW-DBR-20', price: 5799, comparePrice: 7499 },
    ],
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('━━━ Seeding collections ━━━')

  const collectionMap = {}
  for (const col of COLLECTIONS) {
    const c = await prisma.collection.upsert({
      where:  { slug: col.slug },
      create: { ...col, isActive: true },
      update: {},
    })
    collectionMap[col.slug] = c.id
    console.log(`  ✓ Collection: ${c.title}`)
  }

  console.log('\n━━━ Seeding products ━━━')

  let created = 0
  let skipped = 0

  for (const { collection, imageId, variants, ...productData } of PRODUCTS) {
    const collectionId = collectionMap[collection]
    if (!collectionId) {
      console.error(`  ✗ No collection found for slug "${collection}"`)
      continue
    }

    try {
      const existing = await prisma.product.findUnique({ where: { slug: productData.slug } })
      if (existing) {
        console.log(`  – Skipped (already exists): ${productData.title}`)
        skipped++
        continue
      }

      await prisma.product.create({
        data: {
          ...productData,
          collectionId,
          isActive: true,
          images: {
            create: [{ url: img(imageId), publicId: '' }],
          },
          variants: {
            create: variants.map(v => ({
              color:        v.color,
              length:       v.length,
              texture:      '',
              stock:        v.stock,
              sku:          v.sku,
              price:        v.price,
              comparePrice: v.comparePrice,
            })),
          },
        },
      })

      console.log(`  ✓ ${productData.title}`)
      created++
    } catch (err) {
      console.error(`  ✗ ${productData.title}: ${err.message}`)
    }
  }

  console.log(`\n━━━ Done ━━━`)
  console.log(`  Created : ${created}`)
  console.log(`  Skipped : ${skipped}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
