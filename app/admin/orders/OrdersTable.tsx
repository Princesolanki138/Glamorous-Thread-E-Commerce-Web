'use client'

import Link from 'next/link'
import AdminDataTable from '@/component/admin/AdminDataTable'
import type { ColumnDef } from '@tanstack/react-table'

const STATUS_COLORS: Record<string, string> = {
  PENDING:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
  WHATSAPP_SENT: 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20',
  CONFIRMED:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PROCESSING:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SHIPPED:       'bg-sky-500/10 text-sky-400 border-sky-500/20',
  DELIVERED:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED:     'bg-red-500/10 text-red-400 border-red-500/20',
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  UNPAID:          'bg-[#1F1F1F] text-[#BFC0C2] border-[#262626]',
  PAYMENT_PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PAID:            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FAILED:          'bg-red-500/10 text-red-400 border-red-500/20',
  REFUNDED:        'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export interface OrderRow {
  id: string
  orderNumber: string
  shippingName: string
  shippingPhone: string
  total: number
  status: string
  paymentStatus: string
  createdAtLabel: string
  itemCount: number
}

export default function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const columns: ColumnDef<OrderRow, unknown>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }) => (
        <Link
          href={`/admin/orders/${row.original.id}`}
          className="font-mono text-xs text-white border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 rounded-lg hover:border-[#3A3A3A] transition-colors"
        >
          {row.original.orderNumber}
        </Link>
      ),
    },
    {
      accessorKey: 'shippingName',
      header: 'Customer',
      cell: ({ row }) => <span className="text-white">{row.original.shippingName || '—'}</span>,
    },
    {
      accessorKey: 'shippingPhone',
      header: 'Phone',
      cell: ({ row }) => row.original.shippingPhone || '—',
    },
    {
      accessorKey: 'itemCount',
      header: 'Items',
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => <span className="text-white">₹{row.original.total.toLocaleString('en-IN')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border uppercase tracking-wider ${STATUS_COLORS[row.original.status] ?? ''}`}>
          {row.original.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => (
        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border uppercase tracking-wider ${PAYMENT_STATUS_COLORS[row.original.paymentStatus] ?? ''}`}>
          {row.original.paymentStatus.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'createdAtLabel',
      header: 'Date',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link
          href={`/admin/orders/${row.original.id}`}
          className="text-xs text-[#9CA3AF] hover:text-white transition-colors"
        >
          View
        </Link>
      ),
    },
  ]

  return <AdminDataTable columns={columns} data={orders} emptyMessage="No orders found." />
}
