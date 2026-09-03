import { prisma } from '@/lib/prisma'
import ProductForm from '@/component/admin/ProductForm'

export default async function NewProductPage() {
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, title: true },
  })

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-white">New Product</h2>
      <ProductForm collections={collections} />
    </div>
  )
}
