'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface ConfirmButtonProps {
  url: string
  method?: 'DELETE' | 'PATCH' | 'POST'
  body?: Record<string, unknown>
  confirmMessage: string
  className?: string
  children: React.ReactNode
  onSuccess?: () => void
}

export default function ConfirmButton({
  url,
  method = 'DELETE',
  body,
  confirmMessage,
  className = '',
  children,
  onSuccess,
}: ConfirmButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!window.confirm(confirmMessage)) return
    setLoading(true)
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        alert(data?.error || 'Something went wrong.')
        return
      }
      onSuccess?.()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : children}
    </button>
  )
}
