'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const REASONS = [
  'STOCK_ADDED', 'STOCK_REMOVED', 'STOCK_ADJUSTED', 'ORDER_PLACED', 'ORDER_CANCELLED', 'RETURN',
] as const

interface AdjustStockFormProps {
  variantId: string
}

export default function AdjustStockForm({ variantId }: AdjustStockFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [change, setChange] = useState('')
  const [reason, setReason] = useState<typeof REASONS[number]>('STOCK_ADDED')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const changeNum = Number(change)
    if (!changeNum || !Number.isInteger(changeNum)) {
      setError('Enter a non-zero whole number.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/inventory/${variantId}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change: changeNum, reason, note: note || undefined }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Unable to adjust stock.')
        return
      }
      setChange('')
      setNote('')
      setOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-[#1F1F1F] bg-[#141414] px-3 py-1.5 text-xs text-[#9CA3AF] hover:text-white hover:border-[#3A3A3A] transition-colors"
      >
        Adjust
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        value={change}
        onChange={(e) => setChange(e.target.value)}
        placeholder="±qty"
        className="w-20 rounded-lg border border-[#1F1F1F] bg-[#0D0D0D] px-2 py-1.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#3A3A3A]"
      />
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as typeof REASONS[number])}
        className="rounded-lg border border-[#1F1F1F] bg-[#0D0D0D] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3A3A3A]"
      >
        {REASONS.map((r) => (
          <option key={r} value={r}>{r.replace('_', ' ')}</option>
        ))}
      </select>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="w-32 rounded-lg border border-[#1F1F1F] bg-[#0D0D0D] px-2 py-1.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#3A3A3A]"
      />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
      >
        {loading && <Loader2 size={12} className="animate-spin" />}
        Save
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setError(null) }}
        className="text-xs text-[#6B7280] hover:text-white transition-colors"
      >
        Cancel
      </button>
      {error && <p className="w-full text-xs text-red-400">{error}</p>}
    </form>
  )
}
