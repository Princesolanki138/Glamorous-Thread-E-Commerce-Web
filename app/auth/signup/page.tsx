'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Captcha, { useCaptcha } from '@/component/auth/Captcha'
import OtpStep from '@/component/auth/OtpStep'
import { apiErrorMessage, inputClass, labelClass, normalizePhone } from '@/component/auth/authUi'

export default function SignUpPage() {
  const router = useRouter()
  const captcha = useCaptcha()

  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [phoneE164, setPhoneE164] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Sends (or re-sends) the OTP for a phone number. */
  const sendOtp = async (phoneNumber: string) => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(apiErrorMessage(data, 'We could not send a code to that number.'))
  }

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const phone = normalizePhone(mobile)
    if (!phone) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address, or leave it blank.')
      return
    }
    if (!captcha.verify(captchaInput)) {
      setError('The captcha you entered is incorrect.')
      captcha.refresh()
      setCaptchaInput('')
      return
    }

    setSubmitting(true)
    try {
      await sendOtp(phone)
      setPhoneE164(phone)
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send a code to that number.')
      captcha.refresh()
      setCaptchaInput('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerify = async (code: string) => {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneE164, code, email: email.trim() || undefined }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(apiErrorMessage(data, 'That code is incorrect or has expired.'))
        return
      }

      router.push(data?.data?.redirectTo || '/account')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep('details')
    setError(null)
    captcha.refresh()
    setCaptchaInput('')
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="font-cormorant text-2xl text-white tracking-tight mb-10">
        Glamorous Thread
      </Link>

      <div className="w-full max-w-md rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 shadow-luxury">
        <h1 className="font-cormorant text-3xl tracking-tight text-white">Create account</h1>
        <p className="mt-2 mb-8 text-sm text-[#8A8A8A]">
          {step === 'details'
            ? 'Sign up with your mobile number.'
            : 'Enter the code we sent you.'}
        </p>

        {step === 'details' ? (
          <form onSubmit={handleContinue} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className={labelClass}>
                Mobile number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                inputMode="numeric"
                autoComplete="tel"
                required
                disabled={submitting}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email address (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address (optional)"
                autoComplete="email"
                disabled={submitting}
                className={inputClass}
              />
            </div>

            <Captcha
              code={captcha.code}
              value={captchaInput}
              onChange={setCaptchaInput}
              onRefresh={() => {
                captcha.refresh()
                setCaptchaInput('')
              }}
              disabled={submitting}
            />

            <button
              type="submit"
              disabled={submitting}
              className="luxury-button w-full justify-center disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              Continue
            </button>

            <p className="pt-1 text-center text-xs text-[#8A8A8A]">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-white transition-colors hover:text-[#D4D4D4]">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <OtpStep
            phone={phoneE164}
            onVerify={handleVerify}
            onResend={() => sendOtp(phoneE164)}
            onBack={handleBack}
            submitting={submitting}
            error={error}
          />
        )}
      </div>
    </div>
  )
}
