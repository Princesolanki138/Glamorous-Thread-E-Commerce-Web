'use client'

import Link from 'next/link'
import AdminDataTable from '@/component/admin/AdminDataTable'
import type { ColumnDef } from '@tanstack/react-table'
import { Star } from 'lucide-react'
import ReviewActions from './ReviewActions'

export type ReviewRow = {
  id: string
  productTitle: string
  productSlug: string
  customerName: string
  rating: number
  comment: string
  approved: boolean
  dateLabel: string
}

export default function ReviewsTable({ reviews }: { reviews: ReviewRow[] }) {
  const columns: ColumnDef<ReviewRow, unknown>[] = [
    {
      accessorKey: 'productTitle',
      header: 'Product',
      cell: ({ row }) => (
        <Link
          href={`/product/${row.original.productSlug}`}
          target="_blank"
          className="text-white font-medium hover:underline"
        >
          {row.original.productTitle}
        </Link>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => row.original.customerName,
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <span className="flex items-center gap-0.5 text-amber-400">
          {Array.from({ length: row.original.rating }).map((_, i) => (
            <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
          ))}
        </span>
      ),
    },
    {
      accessorKey: 'comment',
      header: 'Comment',
      cell: ({ row }) => (
        <span className="text-[#D1D5DB]">
          {row.original.comment.length > 80
            ? `${row.original.comment.slice(0, 80)}…`
            : row.original.comment}
        </span>
      ),
    },
    {
      accessorKey: 'approved',
      header: 'Approved',
      cell: ({ row }) => (
        <span
          className={`text-[10px] font-medium px-2.5 py-1 rounded-full border uppercase tracking-wider ${
            row.original.approved
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          {row.original.approved ? 'Approved' : 'Pending'}
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
        <ReviewActions reviewId={row.original.id} approved={row.original.approved} />
      ),
    },
  ]

  return <AdminDataTable columns={columns} data={reviews} emptyMessage="No reviews found." />
}
