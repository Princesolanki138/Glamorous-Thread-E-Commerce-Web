import { prisma } from '@/lib/prisma'
import DemoForm from '@/component/admin/DemoForm'

export default async function NewDemoPage() {
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, title: true },
  })

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-white">New Demo Video</h2>
      <DemoForm collections={collections} />
    </div>
  )
}
