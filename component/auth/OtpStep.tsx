'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { displayPhone, inputClass, labelClass, PHONE_CODE_CHANNEL_LABEL } from './authUi'

const OTP_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 30

type OtpStepProps = {
  phone: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
  onBack: () => void
  submitting: boolean
  error: string | null
}

export default function OtpStep({
  phone,
  onVerify,
  onResend,
  onBack,
  submitting,
  error,
}: OtpStepProps) {
  const [code, setCode] = useState('')
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const [resending, setResending] = useState(false)

  // Countdown until "Resend OTP" becomes available again.
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < 4) return
    void onVerify(code)
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    try {
      await onResend()
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setCode('')
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm text-[#8A8A8A]">
          We sent a {OTP_LENGTH}-digit code via {PHONE_CODE_CHANNEL_LABEL} to
        </p>
        <p className="mt-1 text-sm font-medium text-white">{displayPhone(phone)}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div>
        <label className={labelClass}>
          Enter OTP <span className="text-red-400">*</span>
        </label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ''))}
          placeholder={'\u2022'.repeat(OTP_LENGTH)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          autoFocus
          required
          disabled={submitting}
          className={`${inputClass} text-center text-lg tracking-[0.5em]`}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || code.length < 4}
        className="luxury-button w-full justify-center disabled:opacity-50"
      >
        {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
        Verify
      </button>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 text-[#8A8A8A] transition-colors hover:text-white disabled:opacity-50"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          Change number
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending || submitting}
          className="text-[#8A8A8A] transition-colors hover:text-white disabled:opacity-50 disabled:hover:text-[#8A8A8A]"
        >
          {resending ? 'Sending…' : cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
        </button>
      </div>
    </form>
  )
}
