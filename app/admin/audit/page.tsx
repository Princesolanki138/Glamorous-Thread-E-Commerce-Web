import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AuditLogTable, { type AuditLogRow } from './AuditLogTable'

const PAGE_SIZE = 30

// Keep in sync with the AuditAction union exported from lib/audit.ts
const AUDIT_ACTIONS = [
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_DELETED',
  'PRODUCT_BULK_IMPORT',
  'COLLECTION_CREATED',
  'COLLECTION_UPDATED',
  'COLLECTION_DELETED',
  'ORDER_CREATED',
  'ORDER_STATUS_UPDATED',
  'USER_ROLE_UPDATED',
  'USER_DELETED',
  'SETTINGS_UPDATED',
  'COUPON_CREATED',
  'COUPON_UPDATED',
  'COUPON_DELETED',
  'REVIEW_DELETED',
  'ADMIN_LOGIN',
  'ADMIN_LOGOUT',
] as const

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; page?: string }>
}) {
  const { action: actionParam, page: pageParam } = await searchParams
  const action = actionParam && (AUDIT_ACTIONS as readonly string[]).includes(actionParam) ? actionParam : undefined
  const page = Math.max(1, Number(pageParam) || 1)

  const where: Prisma.AuditLogWhereInput = action ? { action } : {}

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { name: true, email: true } },
        targetUser: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const rows: AuditLogRow[] = logs.map((log) => ({
    id: log.id,
    actorName: log.actor?.name ?? null,
    actorEmail: log.actor?.email ?? null,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    createdAt: log.createdAt.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    before: log.before,
    after: log.after,
    metadata: log.metadata,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
  }))

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams()
    if (action) params.set('action', action)
    params.set('page', String(targetPage))
    return `/admin/audit?${params.toString()}`
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {total} event{total !== 1 ? 's' : ''} recorded
          </p>
        </div>
      </div>

      <form method="GET" className="mb-6 flex flex-wrap items-center gap-3">
        <select
          name="action"
          defaultValue={action ?? ''}
          className="rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3A3A3A]"
        >
          <option value="">All Actions</option>
          {AUDIT_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-[#E5E5E5] transition-colors"
        >
          Filter
        </button>
        {action && (
          <Link href="/admin/audit" className="text-sm text-[#6B7280] hover:text-white transition-colors">
            Clear
          </Link>
        )}
      </form>

      <AuditLogTable logs={rows} />

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
