'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import AdminDataTable from '@/component/admin/AdminDataTable'
import ConfirmButton from '@/component/admin/ConfirmButton'

export type CollectionRow = {
  id: string
  title: string
  slug: string
  image: string | null
  isActive: boolean
  sortOrder: number
  productCount: number
}

export default function CollectionsTable({ collections }: { collections: CollectionRow[] }) {
  const columns: ColumnDef<CollectionRow, unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Collection',
      cell: (info) => {
        const c = info.row.original
        return (
          <Link href={`/admin/categories/${c.id}`} className="group flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#1F1F1F] bg-[#141414]">
              {c.image && <Image src={c.image} alt={c.title} fill sizes="44px" className="object-cover" />}
            </div>
            <span className="font-medium text-white group-hover:underline">{c.title}</span>
          </Link>
        )
      },
    },
    { accessorKey: 'slug', header: 'Slug', cell: (info) => <span className="text-[#9CA3AF]">{info.getValue() as string}</span> },
    { accessorKey: 'productCount', header: 'Products' },
    { accessorKey: 'sortOrder', header: 'Sort Order' },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: (info) => (
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
            info.getValue()
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-[#2A2A2A] bg-[#1A1A1A] text-[#6B7280]'
          }`}
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: (info) => {
        const c = info.row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/categories/${c.id}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1F1F1F] text-[#9CA3AF] transition-colors hover:border-[#D4D4D4]/40 hover:text-white"
              aria-label="Edit collection"
            >
              <Pencil size={14} />
            </Link>
            <ConfirmButton
              url={`/api/admin/collections/${c.id}`}
              method="DELETE"
              confirmMessage={`Delete "${c.title}"? This only works if it has no products.`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1F1F1F] text-[#9CA3AF] transition-colors hover:border-red-500/40 hover:text-red-400"
            >
              ✕
            </ConfirmButton>
          </div>
        )
      },
    },
  ]

  return <AdminDataTable columns={columns} data={collections} emptyMessage="No collections found." />
}
