import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ProductsTable, { type ProductRow } from './ProductsTable'

const PAGE_SIZE = 20

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; collectionId?: string }>
}) {
  const { page: pageParam, q, collectionId } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const where = {
    ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
    ...(collectionId ? { collectionId } : {}),
  }

  const [products, total, collections] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        collection: { select: { title: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.collection.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    comparePrice: p.comparePrice,
    isActive: p.isActive,
    featured: p.featured,
    collectionTitle: p.collection.title,
    image: p.images[0]?.url ?? null,
    stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
  }))

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Products</h2>
          <p className="mt-0.5 text-sm text-[#6B7280]">{total} product{total !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-bg transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> New Product
        </Link>
      </div>

      <form className="mb-5 flex flex-wrap gap-3" method="GET">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className="h-10 w-64 rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 text-sm text-white placeholder-[#555555] outline-none focus:border-[#D4D4D4]/40"
        />
        <select
          name="collectionId"
          defaultValue={collectionId ?? ''}
          className="h-10 rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 text-sm text-white outline-none focus:border-[#D4D4D4]/40"
        >
          <option value="">All Collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-xl border border-[#1F1F1F] bg-[#141414] px-5 text-sm text-[#9CA3AF] transition-colors hover:text-white"
        >
          Filter
        </button>
      </form>

      <ProductsTable products={rows} />

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(collectionId ? { collectionId } : {}), page: String(page - 1) })}`}
              className="rounded-lg border border-[#1F1F1F] px-4 py-2 text-sm text-[#9CA3AF] hover:text-white"
            >
              Previous
            </Link>
          )}
          <span className="px-3 text-sm text-[#6B7280]">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(collectionId ? { collectionId } : {}), page: String(page + 1) })}`}
              className="rounded-lg border border-[#1F1F1F] px-4 py-2 text-sm text-[#9CA3AF] hover:text-white"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
