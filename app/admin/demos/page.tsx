import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import DemosTable, { type DemoRow } from './DemosTable'

export default async function AdminDemosPage() {
  const demos = await prisma.productDemo.findMany({
    include: { collection: { select: { title: true } } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  const rows: DemoRow[] = demos.map((d) => ({
    id: d.id,
    title: d.title,
    collectionTitle: d.collection.title,
    posterUrl: d.posterUrl,
    sortOrder: d.sortOrder,
    isActive: d.isActive,
  }))

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Product Demos</h2>
          <p className="mt-0.5 text-sm text-[#6B7280]">
            {demos.length} video{demos.length !== 1 ? 's' : ''} — shown in the Product Demo carousel on the homepage
          </p>
        </div>
        <Link
          href="/admin/demos/new"
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-bg transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> New Demo
        </Link>
      </div>

      <DemosTable demos={rows} />
    </div>
  )
}
