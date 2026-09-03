import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CollectionForm from '@/component/admin/CollectionForm'

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const collection = await prisma.collection.findUnique({ where: { id } })
  if (!collection) notFound()

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-white">Edit Collection</h2>
      <CollectionForm collection={collection} />
    </div>
  )
}
