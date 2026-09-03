'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { ColumnDef } from '@tanstack/react-table'
import AdminDataTable from '@/component/admin/AdminDataTable'

export interface WishlistRow {
  productId: string
  slug: string
  title: string
  price: number
  image: string | null
  count: number
}

export default function WishlistTable({ rows }: { rows: WishlistRow[] }) {
  const columns: ColumnDef<WishlistRow, unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Product',
      cell: ({ row }) => (
        <Link
          href={`/product/${row.original.slug}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 group w-fit"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-[#1A1A1A] shrink-0 border border-[#1F1F1F]">
            {row.original.image ? (
              <Image src={row.original.image} alt={row.original.title} fill className="object-cover" />
            ) : null}
          </div>
          <span className="text-white group-hover:underline">{row.original.title}</span>
        </Link>
      ),
    },
    {
      accessorKey: 'count',
      header: 'Times Wishlisted',
      cell: ({ row }) => <span className="text-white font-medium">{row.original.count}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => <span>₹{row.original.price.toLocaleString('en-IN')}</span>,
    },
  ]

  return <AdminDataTable columns={columns} data={rows} emptyMessage="No wishlist data." />
}
