'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Banknote, CheckCircle2, Loader2, Send, XCircle } from 'lucide-react'

interface PaymentActionsProps {
  orderId: string
  orderStatus: string
  paymentStatus: string
}

type Action = 'confirm' | 'reject' | 'reminder' | 'markPaid'

export default function PaymentActions({ orderId, orderStatus, paymentStatus }: PaymentActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<Action | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isEligibleForConfirm = (orderStatus === 'PENDING' || orderStatus === 'WHATSAPP_SENT') && paymentStatus !== 'PAID'
  const isEligibleForReminder = orderStatus !== 'CANCELLED' && (paymentStatus === 'PAYMENT_PENDING' || paymentStatus === 'FAILED')
  const isEligibleForMarkPaid = orderStatus !== 'CANCELLED' && paymentStatus !== 'PAID'

  // Since there's no gateway to notify us, there's nothing to poll for — a
  // human always has to click "Mark as Paid" after verifying receipt. No
  // auto-refresh needed here.

  const runAction = async (action: Action, confirmMessage: string, body?: Record<string, unknown>) => {
    if (!window.confirm(confirmMessage)) return
    setLoading(action)
    setError(null)
    try {
      const url =
        action === 'confirm'
          ? `/api/admin/orders/${orderId}/confirm`
          : action === 'reminder'
            ? `/api/admin/orders/${orderId}/resend-payment`
            : action === 'markPaid'
              ? `/api/admin/orders/${orderId}/mark-paid`
              : `/api/admin/orders/${orderId}`

      const res = await fetch(url, {
        method: action === 'reject' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'reject' ? JSON.stringify({ status: 'CANCELLED' }) : body ? JSON.stringify(body) : undefined,
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Something went wrong.')
        return
      }

      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const handleMarkPaid = () => {
    const note = window.prompt('Optional note (e.g. UPI reference, how payment was confirmed):') ?? undefined
    void runAction('markPaid', 'Mark this order as paid? This cannot be automatically undone.', note ? { note } : undefined)
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isEligibleForConfirm && (
          <>
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => runAction('confirm', 'Confirm this order and send the customer payment instructions via WhatsApp?')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-sm text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
            >
              {loading === 'confirm' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Confirm Order
            </button>
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => runAction('reject', 'Reject this order? Stock will be restocked and this cannot be undone.')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              {loading === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Reject Order
            </button>
          </>
        )}
        {isEligibleForReminder && (
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => runAction('reminder', 'Send a payment reminder to the customer via WhatsApp?')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#1F1F1F] bg-[#141414] px-4 py-2.5 text-sm text-[#9CA3AF] transition-colors hover:text-white disabled:opacity-50"
          >
            {loading === 'reminder' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send Payment Reminder
          </button>
        )}
        {isEligibleForMarkPaid && (
          <button
            type="button"
            disabled={loading !== null}
            onClick={handleMarkPaid}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-sm text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
          >
            {loading === 'markPaid' ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />}
            Mark as Paid
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
