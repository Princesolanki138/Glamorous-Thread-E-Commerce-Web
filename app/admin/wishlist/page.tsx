import { prisma } from '@/lib/prisma'
import AdminBarChart from '@/component/admin/AdminBarChart'
import WishlistTable, { type WishlistRow } from './WishlistTable'
import { Heart } from 'lucide-react'

export default async function AdminWishlistPage() {
  const grouped = await prisma.wishlist.groupBy({
    by: ['productId'],
    _count: { productId: true },
    orderBy: { _count: { productId: 'desc' } },
    take: 50,
  })

  if (grouped.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Wishlist Analytics</h1>
          <p className="text-sm text-[#6B7280] mt-1">Most-wishlisted products across the store</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-[#2A2A2A] bg-[#0D0D0D]">
          <Heart className="w-12 h-12 text-[#2A2A2A] mb-4" strokeWidth={1} />
          <h2 className="text-lg font-semibold text-white mb-1">No wishlist activity yet</h2>
          <p className="text-sm text-[#555555]">When customers add products to their wishlist, insights will appear here.</p>
        </div>
      </div>
    )
  }

  const productIds = grouped.map((g) => g.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { url: true } },
    },
  })
  const productMap = new Map(products.map((p) => [p.id, p]))

  const rows: WishlistRow[] = grouped
    .map((g) => {
      const p = productMap.get(g.productId)
      if (!p) return null
      const row: WishlistRow = {
        productId: g.productId,
        count: g._count.productId,
        title: p.title,
        slug: p.slug,
        price: p.price,
        image: p.images[0]?.url ?? null,
      }
      return row
    })
    .filter((r): r is WishlistRow => r !== null)

  const chartData = rows.slice(0, 10).map((r) => ({
    label: r.title.length > 18 ? `${r.title.slice(0, 18)}…` : r.title,
    value: r.count,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Wishlist Analytics</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {rows.length} product{rows.length !== 1 ? 's' : ''} wishlisted
        </p>
      </div>

      <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-5 mb-6">
        <p className="text-xs text-[#6B7280] uppercase tracking-widest mb-4">Top Wishlisted Products</p>
        <AdminBarChart data={chartData} valueLabel="Wishlisted" />
      </div>

      <WishlistTable rows={rows} />
    </div>
  )
}
