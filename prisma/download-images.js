/**
 * Downloads the IndiaMART product photos into /public/products/<slug>/ so the
 * storefront serves them itself instead of hotlinking a third-party CDN.
 * Idempotent: files that already exist are skipped.
 *
 *   node prisma/download-images.js
 */
const fs = require('fs')
const path = require('path')
const { PRODUCTS } = require('./indiamart-data')

const CONCURRENCY = 8

function extFor(url) {
  const ext = path.extname(new URL(url).pathname).toLowerCase()
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg'
}

/** Local public path a given product image is stored at. */
function localPathFor(slug, url, index) {
  return `/products/${slug}/${index + 1}${extFor(url)}`
}

async function downloadOne(url, destAbs) {
  if (fs.existsSync(destAbs) && fs.statSync(destAbs).size > 0) return 'skipped'

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length === 0) throw new Error('empty body')

  fs.mkdirSync(path.dirname(destAbs), { recursive: true })
  fs.writeFileSync(destAbs, buf)
  return 'downloaded'
}

async function main() {
  const jobs = []
  for (const product of PRODUCTS) {
    product.images.forEach((url, i) => {
      const rel = localPathFor(product.slug, url, i)
      jobs.push({ url, rel, abs: path.join(__dirname, '..', 'public', rel.replace(/^\/+/, '')) })
    })
  }

  console.log(`${jobs.length} images across ${PRODUCTS.length} products`)

  const stats = { downloaded: 0, skipped: 0, failed: 0 }
  const failures = []

  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const batch = jobs.slice(i, i + CONCURRENCY)
    await Promise.all(
      batch.map(async (job) => {
        try {
          const result = await downloadOne(job.url, job.abs)
          stats[result]++
        } catch (e) {
          stats.failed++
          failures.push(`${job.rel}  <-  ${job.url}  (${e.message})`)
        }
      }),
    )
    process.stdout.write(`\r  ${Math.min(i + CONCURRENCY, jobs.length)}/${jobs.length}`)
  }

  console.log('\n', JSON.stringify(stats))
  if (failures.length) {
    console.log('FAILURES:')
    failures.forEach((f) => console.log('  ' + f))
  }
}

module.exports = { localPathFor }

if (require.main === module) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
