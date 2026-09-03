'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import type { CouponRow } from './types'

function toLocalInput(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const inputClass =
  'w-full rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#3A3A3A]'
const labelClass = 'block text-xs uppercase tracking-[0.1em] text-[#6B7280] mb-1.5'

export default function CouponForm({ coupon, onDone }: { coupon?: CouponRow; onDone?: () => void }) {
  const isEdit = !!coupon
  const router = useRouter()
  const [open, setOpen] = useState(isEdit)

  const [code, setCode] = useState(coupon?.code ?? '')
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>(
    (coupon?.discountType as 'PERCENTAGE' | 'FIXED') ?? 'PERCENTAGE'
  )
  const [discountValue, setDiscountValue] = useState(coupon ? String(coupon.discountValue) : '')
  const [minOrderAmount, setMinOrderAmount] = useState(
    coupon?.minOrderAmount != null ? String(coupon.minOrderAmount) : ''
  )
  const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit != null ? String(coupon.usageLimit) : '')
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true)
  const [startsAt, setStartsAt] = useState(toLocalInput(coupon?.startsAt ?? null))
  const [expiresAt, setExpiresAt] = useState(toLocalInput(coupon?.expiresAt ?? null))

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isEdit && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-[#E5E5E5] transition-colors"
      >
        <Plus size={15} />
        New Coupon
      </button>
    )
  }

  const handleCancel = () => {
    if (isEdit) {
      onDone?.()
    } else {
      setOpen(false)
      setError(null)
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!code.trim() || !discountValue) {
      setError('Code and discount value are required.')
      return
    }

    const payload: Record<string, unknown> = {
      code: code.trim(),
      discountType,
      discountValue: Number(discountValue),
      isActive,
    }
    if (minOrderAmount) payload.minOrderAmount = Number(minOrderAmount)
    if (usageLimit) payload.usageLimit = Number(usageLimit)
    if (startsAt) payload.startsAt = new Date(startsAt).toISOString()
    if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString()

    setIsSubmitting(true)
    try {
      const res = await fetch(isEdit ? `/api/admin/coupons/${coupon!.id}` : '/api/admin/coupons', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Something went wrong.')
        return
      }

      router.refresh()
      if (isEdit) {
        onDone?.()
      } else {
        setOpen(false)
        setCode('')
        setDiscountType('PERCENTAGE')
        setDiscountValue('')
        setMinOrderAmount('')
        setUsageLimit('')
        setIsActive(true)
        setStartsAt('')
        setExpiresAt('')
      }
    } catch {
      setError('Unable to save coupon. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6 space-y-5"
    >
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="coupon-code">Code</label>
          <input
            id="coupon-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="WELCOME10"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="coupon-type">Discount Type</label>
          <select
            id="coupon-type"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
            className={inputClass}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="coupon-value">
            {discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Discount (₹)'}
          </label>
          <input
            id="coupon-value"
            type="number"
            min="0"
            step="0.01"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="coupon-min-order">Min Order Amount (₹)</label>
          <input
            id="coupon-min-order"
            type="number"
            min="0"
            step="0.01"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            placeholder="Optional"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="coupon-usage-limit">Usage Limit</label>
          <input
            id="coupon-usage-limit"
            type="number"
            min="1"
            step="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Optional"
            className={inputClass}
          />
        </div>

        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-[#D1D5DB]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-[#1F1F1F] bg-[#0D0D0D]"
            />
            Active
          </label>
        </div>

        <div>
          <label className={labelClass} htmlFor="coupon-starts">Starts At</label>
          <input
            id="coupon-starts"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="coupon-expires">Expires At</label>
          <input
            id="coupon-expires"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Coupon'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-xl border border-[#1F1F1F] px-5 py-2.5 text-sm text-[#9CA3AF] hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
