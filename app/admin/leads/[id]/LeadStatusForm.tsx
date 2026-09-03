'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { LeadStatus } from '@prisma/client'

const LEAD_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED']

export default function LeadStatusForm({
  leadId,
  initialStatus,
  initialNotes,
}: {
  leadId: string
  initialStatus: LeadStatus
  initialNotes: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState<LeadStatus>(initialStatus)
  const [notes, setNotes] = useState(initialNotes)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Something went wrong.')
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
      <p className="text-xs uppercase tracking-widest text-[#6B7280] mb-4">Update Lead</p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-[#6B7280] mb-1.5">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
            className="w-full rounded-xl border border-[#1F1F1F] bg-[#141414] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3A3A3A]"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#6B7280] mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Internal notes about this lead..."
            className="w-full rounded-xl border border-[#1F1F1F] bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#3A3A3A] resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-[#E5E5E5] transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Save
        </button>
      </div>
    </div>
  )
}
