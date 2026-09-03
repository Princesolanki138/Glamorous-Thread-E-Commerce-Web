'use client'

import Link from 'next/link'
import AdminDataTable from '@/component/admin/AdminDataTable'
import type { ColumnDef } from '@tanstack/react-table'
import { ShieldCheck } from 'lucide-react'

export type CustomerRow = {
  id: string
  name: string | null
  email: string
  phone: string | null
  isAdmin: boolean
  orderCount: number
  lifetimeSpend: number
  joinedLabel: string
}

export default function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const columns: ColumnDef<CustomerRow, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/customers/${row.original.id}`}
            className="text-white font-medium hover:underline"
          >
            {row.original.name || 'Unnamed'}
          </Link>
          {row.original.isAdmin && (
            <span className="flex items-center gap-1 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#BFC0C2]">
              <ShieldCheck size={11} />
              Admin
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || '—',
    },
    {
      accessorKey: 'orderCount',
      header: 'Orders',
      cell: ({ row }) => row.original.orderCount,
    },
    {
      accessorKey: 'lifetimeSpend',
      header: 'Lifetime Spend',
      cell: ({ row }) => (
        <span className="text-white">₹{row.original.lifetimeSpend.toLocaleString('en-IN')}</span>
      ),
    },
    {
      accessorKey: 'joinedLabel',
      header: 'Joined',
      cell: ({ row }) => row.original.joinedLabel,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link
          href={`/admin/customers/${row.original.id}`}
          className="text-xs text-[#9CA3AF] hover:text-white transition-colors"
        >
          View
        </Link>
      ),
    },
  ]

  return <AdminDataTable columns={columns} data={customers} emptyMessage="No customers found." />
}
