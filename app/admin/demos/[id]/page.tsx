import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DemoForm from '@/component/admin/DemoForm'

export default async function EditDemoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [demo, collections] = await Promise.all([
    prisma.productDemo.findUnique({ where: { id } }),
    prisma.collection.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, title: true },
    }),
  ])

  if (!demo) notFound()

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-white">Edit Demo Video</h2>
      <DemoForm collections={collections} demo={demo} />
    </div>
  )
}
