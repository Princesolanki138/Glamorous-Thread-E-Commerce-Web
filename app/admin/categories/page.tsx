import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import CollectionsTable, { type CollectionRow } from './CollectionsTable'

export default async function AdminCategoriesPage() {
  const collections = await prisma.collection.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  const rows: CollectionRow[] = collections.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    image: c.image,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    productCount: c._count.products,
  }))

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Collections</h2>
          <p className="mt-0.5 text-sm text-[#6B7280]">{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-bg transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> New Collection
        </Link>
      </div>

      <CollectionsTable collections={rows} />
    </div>
  )
}
