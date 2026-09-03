import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Prisma, LeadSource, LeadStatus } from '@prisma/client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import LeadsTable, { type LeadRow } from './LeadsTable'

const PAGE_SIZE = 20

const LEAD_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED']
const LEAD_SOURCES: LeadSource[] = ['CONTACT_FORM', 'CONSULTATION_FORM', 'PRODUCT_INQUIRY', 'WHATSAPP_INQUIRY']

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; source?: string }>
}) {
  const { page: pageParam, status: statusParam, source: sourceParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const status = statusParam && LEAD_STATUSES.includes(statusParam as LeadStatus) ? (statusParam as LeadStatus) : undefined
  const source = sourceParam && LEAD_SOURCES.includes(sourceParam as LeadSource) ? (sourceParam as LeadSource) : undefined

  const where: Prisma.LeadWhereInput = {}
  if (status) where.status = status
  if (source) where.source = source

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const leadRows: LeadRow[] = items.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    subject: lead.subject,
    source: lead.source,
    status: lead.status,
    dateLabel: lead.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  }))

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (source) params.set('source', source)
    params.set('page', String(targetPage))
    return `/admin/leads?${params.toString()}`
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads (CRM)</h1>
          <p className="text-sm text-[#6B7280] mt-1">{total} lead{total !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      <form method="GET" className="mb-6 flex flex-wrap items-center gap-3">
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3A3A3A]"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          name="source"
          defaultValue={source ?? ''}
          className="rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3A3A3A]"
        >
          <option value="">All Sources</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-[#E5E5E5] transition-colors"
        >
          Filter
        </button>
        {(status || source) && (
          <Link href="/admin/leads" className="text-sm text-[#6B7280] hover:text-white transition-colors">
            Clear
          </Link>
        )}
      </form>

      <LeadsTable leads={leadRows} />

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
