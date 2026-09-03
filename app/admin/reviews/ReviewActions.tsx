'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import ConfirmButton from '@/component/admin/ConfirmButton'

export default function ReviewActions({
  reviewId,
  approved,
}: {
  reviewId: string
  approved: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !approved }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        alert(data?.error || 'Something went wrong.')
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
          approved
            ? 'border border-[#2A2A2A] bg-[#1A1A1A] text-[#D1D5DB] hover:text-white'
            : 'bg-white text-black hover:bg-[#E5E5E5]'
        }`}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : approved ? 'Unapprove' : 'Approve'}
      </button>
      <ConfirmButton
        url={`/api/admin/reviews/${reviewId}`}
        method="DELETE"
        confirmMessage="Delete this review permanently?"
        className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
      >
        Delete
      </ConfirmButton>
    </div>
  )
}
