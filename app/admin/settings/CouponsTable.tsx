'use client'

import type { ColumnDef } from '@tanstack/react-table'
import AdminDataTable from '@/component/admin/AdminDataTable'
import CouponActions from './CouponActions'
import type { CouponRow } from './types'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function CouponsTable({ coupons }: { coupons: CouponRow[] }) {
  const columns: ColumnDef<CouponRow, unknown>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-white border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 rounded-lg">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'discountType',
      header: 'Type',
      cell: ({ row }) => (row.original.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed'),
    },
    {
      accessorKey: 'discountValue',
      header: 'Value',
      cell: ({ row }) =>
        row.original.discountType === 'PERCENTAGE'
          ? `${row.original.discountValue}%`
          : `₹${row.original.discountValue.toLocaleString('en-IN')}`,
    },
    {
      accessorKey: 'minOrderAmount',
      header: 'Min Order',
      cell: ({ row }) =>
        row.original.minOrderAmount != null ? `₹${row.original.minOrderAmount.toLocaleString('en-IN')}` : '—',
    },
    {
      id: 'usage',
      header: 'Usage',
      cell: ({ row }) => `${row.original.usedCount}/${row.original.usageLimit ?? '∞'}`,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`text-[10px] font-medium px-2.5 py-1 rounded-full border uppercase tracking-wider ${
            row.original.isActive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-[#1F1F1F] text-[#6B7280] border-[#2A2A2A]'
          }`}
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      accessorKey: 'expiresAt',
      header: 'Expires',
      cell: ({ row }) => formatDate(row.original.expiresAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <CouponActions coupon={row.original} />,
    },
  ]

  return <AdminDataTable columns={columns} data={coupons} emptyMessage="No coupons yet." />
}
