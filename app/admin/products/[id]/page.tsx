import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductForm from '@/component/admin/ProductForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, collections] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true },
    }),
    prisma.collection.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, title: true } }),
  ])

  if (!product) notFound()

  // `specs` is stored as free-form JSON; narrow it to the string map the form edits.
  const specs =
    product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs)
      ? Object.fromEntries(Object.entries(product.specs).map(([k, v]) => [k, String(v)]))
      : null

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-white">Edit Product</h2>
      <ProductForm collections={collections} product={{ ...product, specs }} />
    </div>
  )
}
