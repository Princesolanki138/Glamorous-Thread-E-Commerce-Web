'use client'

import type { ColumnDef } from '@tanstack/react-table'
import AdminDataTable from '@/component/admin/AdminDataTable'

export interface AuditLogRow {
  id: string
  actorName: string | null
  actorEmail: string | null
  action: string
  entityType: string | null
  entityId: string | null
  createdAt: string
  before: unknown
  after: unknown
  metadata: unknown
  ipAddress: string | null
  userAgent: string | null
}

function actionColor(action: string) {
  if (action.includes('DELETED')) return 'bg-red-500/10 text-red-400 border-red-500/20'
  if (action.includes('UPDATED')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  if (action.includes('CREATED') || action.includes('LOGIN')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  return 'bg-[#1F1F1F] text-[#9CA3AF] border-[#2A2A2A]'
}

function isEmptyJson(value: unknown) {
  if (value === null || value === undefined) return true
  if (typeof value === 'object') return Object.keys(value as object).length === 0
  return false
}

export default function AuditLogTable({ logs }: { logs: AuditLogRow[] }) {
  const columns: ColumnDef<AuditLogRow, unknown>[] = [
    {
      id: 'actor',
      header: 'Actor',
      cell: ({ row }) =>
        row.original.actorName || row.original.actorEmail ? (
          <div>
            <p className="text-white">{row.original.actorName || 'Unnamed'}</p>
            <p className="text-xs text-[#6B7280]">{row.original.actorEmail}</p>
          </div>
        ) : (
          <span className="text-[#6B7280] italic">System</span>
        ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <span
          className={`text-[10px] font-medium px-2.5 py-1 rounded-full border uppercase tracking-wider ${actionColor(row.original.action)}`}
        >
          {row.original.action.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      id: 'entity',
      header: 'Entity',
      cell: ({ row }) => (
        <div>
          <p className="text-white">{row.original.entityType ?? '—'}</p>
          {row.original.entityId && (
            <p className="font-mono text-xs text-[#6B7280] mt-0.5">{row.original.entityId.slice(0, 12)}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Timestamp',
      cell: ({ row }) => <span className="text-[#D1D5DB] whitespace-nowrap">{row.original.createdAt}</span>,
    },
    {
      id: 'details',
      header: '',
      cell: ({ row }) => {
        const log = row.original
        const hasDetails =
          !isEmptyJson(log.before) || !isEmptyJson(log.after) || !isEmptyJson(log.metadata) || log.ipAddress || log.userAgent
        if (!hasDetails) return <span className="text-xs text-[#3A3A3A]">—</span>
        return (
          <details>
            <summary className="cursor-pointer text-xs text-[#9CA3AF] hover:text-white transition-colors select-none">
              View
            </summary>
            <div className="mt-2 space-y-2 max-w-md">
              {(log.ipAddress || log.userAgent) && (
                <div className="text-xs text-[#6B7280] space-y-0.5">
                  {log.ipAddress && <p>IP: {log.ipAddress}</p>}
                  {log.userAgent && <p className="truncate">UA: {log.userAgent}</p>}
                </div>
              )}
              {!isEmptyJson(log.before) && (
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Before</p>
                  <pre className="text-[11px] font-mono text-[#9CA3AF] bg-[#141414] border border-[#1F1F1F] rounded-lg p-2.5 overflow-auto max-h-40">
                    {JSON.stringify(log.before, null, 2)}
                  </pre>
                </div>
              )}
              {!isEmptyJson(log.after) && (
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">After</p>
                  <pre className="text-[11px] font-mono text-[#9CA3AF] bg-[#141414] border border-[#1F1F1F] rounded-lg p-2.5 overflow-auto max-h-40">
                    {JSON.stringify(log.after, null, 2)}
                  </pre>
                </div>
              )}
              {!isEmptyJson(log.metadata) && (
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Metadata</p>
                  <pre className="text-[11px] font-mono text-[#9CA3AF] bg-[#141414] border border-[#1F1F1F] rounded-lg p-2.5 overflow-auto max-h-40">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )
      },
    },
  ]

  return <AdminDataTable columns={columns} data={logs} emptyMessage="No audit events found." />
}
