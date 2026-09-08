'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Video } from 'lucide-react'
import AdminDataTable from '@/component/admin/AdminDataTable'
import ConfirmButton from '@/component/admin/ConfirmButton'

export type DemoRow = {
  id: string
  title: string
  collectionTitle: string
  posterUrl: string | null
  sortOrder: number
  isActive: boolean
}

export default function DemosTable({ demos }: { demos: DemoRow[] }) {
  const columns: ColumnDef<DemoRow, unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Demo',
      cell: (info) => {
        const d = info.row.original
        return (
          <Link href={`/admin/demos/${d.id}`} className="group flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#1F1F1F] bg-[#141414]">
              {d.posterUrl ? (
                <Image src={d.posterUrl} alt={d.title} fill sizes="44px" className="object-cover" />
              ) : (
                <Video size={15} className="text-[#3A3A3A]" />
              )}
            </div>
            <span className="font-medium text-white group-hover:underline">{d.title}</span>
          </Link>
        )
      },
    },
    {
      accessorKey: 'collectionTitle',
      header: 'Collection',
      cell: (info) => <span className="text-[#9CA3AF]">{info.getValue() as string}</span>,
    },
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
        const d = info.row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/demos/${d.id}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1F1F1F] text-[#9CA3AF] transition-colors hover:border-[#D4D4D4]/40 hover:text-white"
              aria-label="Edit demo"
            >
              <Pencil size={14} />
            </Link>
            <ConfirmButton
              url={`/api/admin/demos/${d.id}`}
              method="DELETE"
              confirmMessage={`Delete "${d.title}"?`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1F1F1F] text-[#9CA3AF] transition-colors hover:border-red-500/40 hover:text-red-400"
            >
              ✕
            </ConfirmButton>
          </div>
        )
      },
    },
  ]

  return <AdminDataTable columns={columns} data={demos} emptyMessage="No demo videos yet." />
}
