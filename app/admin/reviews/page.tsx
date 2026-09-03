import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ReviewsTable, { type ReviewRow } from './ReviewsTable'

const PAGE_SIZE = 20

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; approved?: string }>
}) {
  const { page: pageParam, approved: approvedParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const approved =
    approvedParam === 'true' ? true : approvedParam === 'false' ? false : undefined

  const where: Prisma.ReviewWhereInput = {}
  if (approved !== undefined) where.approved = approved

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true, phoneNumber: true } },
        product: { select: { title: true, slug: true } },
      },
    }),
    prisma.review.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const reviewRows: ReviewRow[] = items.map((review) => ({
    id: review.id,
    productTitle: review.product.title,
    productSlug: review.product.slug,
    customerName: review.user.name || review.user.email || review.user.phoneNumber,
    rating: review.rating,
    comment: review.comment,
    approved: review.approved,
    dateLabel: review.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  }))

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams()
    if (approved !== undefined) params.set('approved', String(approved))
    params.set('page', String(targetPage))
    return `/admin/reviews?${params.toString()}`
  }

  const buildFilterHref = (value?: boolean) => {
    const params = new URLSearchParams()
    if (value !== undefined) params.set('approved', String(value))
    return `/admin/reviews?${params.toString()}`
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews</h1>
          <p className="text-sm text-[#6B7280] mt-1">{total} review{total !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Link
          href={buildFilterHref(undefined)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            approved === undefined
              ? 'bg-white text-black'
              : 'border border-[#1F1F1F] bg-[#0D0D0D] text-[#9CA3AF] hover:text-white'
          }`}
        >
          All
        </Link>
        <Link
          href={buildFilterHref(false)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            approved === false
              ? 'bg-white text-black'
              : 'border border-[#1F1F1F] bg-[#0D0D0D] text-[#9CA3AF] hover:text-white'
          }`}
        >
          Pending
        </Link>
        <Link
          href={buildFilterHref(true)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            approved === true
              ? 'bg-white text-black'
              : 'border border-[#1F1F1F] bg-[#0D0D0D] text-[#9CA3AF] hover:text-white'
          }`}
        >
          Approved
        </Link>
      </div>

      <ReviewsTable reviews={reviewRows} />

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={buildPageHref(Math.max(1, page - 1))}
              aria-disabled={page <= 1}
              className={`flex items-center gap-1 rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-3 py-2 text-xs text-[#9CA3AF] hover:text-white transition-colors ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
            >
              <ChevronLeft size={14} />
              Prev
            </Link>
            <Link
              href={buildPageHref(Math.min(totalPages, page + 1))}
              aria-disabled={page >= totalPages}
              className={`flex items-center gap-1 rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-3 py-2 text-xs text-[#9CA3AF] hover:text-white transition-colors ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
            >
              Next
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
