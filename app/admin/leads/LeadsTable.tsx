'use client'

import Link from 'next/link'
import AdminDataTable from '@/component/admin/AdminDataTable'
import type { ColumnDef } from '@tanstack/react-table'
import type { LeadSource, LeadStatus } from '@prisma/client'

const STATUS_COLORS: Record<string, string> = {
  NEW:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CONTACTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  QUALIFIED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CONVERTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED:    'bg-[#1F1F1F] text-[#9CA3AF] border-[#262626]',
}

export type LeadRow = {
  id: string
  name: string
  email: string | null
  phone: string
  subject: string | null
  source: LeadSource
  status: LeadStatus
  dateLabel: string
}

export default function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const columns: ColumnDef<LeadRow, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link href={`/admin/leads/${row.original.id}`} className="text-white font-medium hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || '—',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone,
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => row.original.subject || '—',
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => (
        <span className="text-xs text-[#9CA3AF]">{row.original.source.replace(/_/g, ' ')}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border uppercase tracking-wider ${STATUS_COLORS[row.original.status] ?? ''}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'dateLabel',
      header: 'Date',
      cell: ({ row }) => row.original.dateLabel,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link
          href={`/admin/leads/${row.original.id}`}
          className="text-xs text-[#9CA3AF] hover:text-white transition-colors"
        >
          View
        </Link>
      ),
    },
  ]

  return <AdminDataTable columns={columns} data={leads} emptyMessage="No leads found." />
}
