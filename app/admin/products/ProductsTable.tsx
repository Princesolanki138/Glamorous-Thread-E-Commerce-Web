'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import AdminDataTable from '@/component/admin/AdminDataTable'
import ConfirmButton from '@/component/admin/ConfirmButton'

export type ProductRow = {
  id: string
  title: string
  slug: string
  price: number
  comparePrice: number | null
  isActive: boolean
  featured: boolean
  collectionTitle: string
  image: string | null
  stock: number
}

export default function ProductsTable({ products }: { products: ProductRow[] }) {
  const columns: ColumnDef<ProductRow, unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Product',
      cell: (info) => {
        const p = info.row.original
        return (
          <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 group">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#1F1F1F] bg-[#141414]">
              {p.image && <Image src={p.image} alt={p.title} fill sizes="44px" className="object-cover" />}
            </div>
            <span className="font-medium text-white group-hover:underline line-clamp-1">{p.title}</span>
          </Link>
        )
      },
    },
    {
      accessorKey: 'collectionTitle',
      header: 'Collection',
      cell: (info) => <span className="text-[#9CA3AF]">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: (info) => {
        const p = info.row.original
        return (
          <span className="whitespace-nowrap">
            ₹{p.price.toLocaleString('en-IN')}
            {p.comparePrice && (
              <span className="ml-1.5 text-xs text-[#555555] line-through">
                ₹{p.comparePrice.toLocaleString('en-IN')}
              </span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: (info) => {
        const stock = info.getValue() as number
        return (
          <span className={stock === 0 ? 'text-red-400' : stock <= 5 ? 'text-amber-400' : 'text-[#D1D5DB]'}>
            {stock}
          </span>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: (info) => {
        const p = info.row.original
        return (
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                info.getValue()
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                  : 'border-[#2A2A2A] bg-[#1A1A1A] text-[#6B7280]'
              }`}
            >
              {info.getValue() ? 'Active' : 'Inactive'}
            </span>
            {p.featured && (
              <span className="rounded-full border border-[#D4D4D4]/20 bg-[#D4D4D4]/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#D4D4D4]">
                Featured
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: (info) => {
        const p = info.row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/products/${p.id}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1F1F1F] text-[#9CA3AF] transition-colors hover:border-[#D4D4D4]/40 hover:text-white"
              aria-label="Edit product"
            >
              <Pencil size={14} />
            </Link>
            <ConfirmButton
              url={`/api/admin/products/${p.id}`}
              method="DELETE"
              confirmMessage={`Delete "${p.title}"? This cannot be undone.`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1F1F1F] text-[#9CA3AF] transition-colors hover:border-red-500/40 hover:text-red-400"
            >
              ✕
            </ConfirmButton>
          </div>
        )
      },
    },
  ]

  return <AdminDataTable columns={columns} data={products} emptyMessage="No products found." />
}
