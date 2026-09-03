import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function ProductBreadcrumb({
  product,
}: {
  product: {
    title: string
    collection?: string | null
    collectionSlug?: string | null
  }
}) {
  return (
    <nav
      className="
        flex
        items-center
        flex-wrap
        gap-2
        text-sm
        text-neutral-500
        mb-8
      "
    >
      <Link
        href="/"
        className="
          transition-colors
          duration-300
          hover:text-black
        "
      >
        Home
      </Link>

      <ChevronRight size={14} className="text-neutral-400" />

      <Link
        href="/collection"
        className="
          transition-colors
          duration-300
          hover:text-black
        "
      >
        Collections
      </Link>

      <ChevronRight size={14} className="text-neutral-400" />

      <Link
        href={`/collection/${product.collectionSlug || ''}`}
        className="
          transition-colors
          duration-300
          hover:text-black
          capitalize
        "
      >
        {product.collection}
      </Link>

      <ChevronRight size={14} className="text-neutral-400" />

      <span
        className="
          text-white
          font-medium
          truncate
          max-w-[220px]
          md:max-w-full
        "
      >
        {product.title}
      </span>
    </nav>
  )
}