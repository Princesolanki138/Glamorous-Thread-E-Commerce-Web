'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

// Same field styling as the checkout form (component/checkout/CheckoutAddress.tsx).
const inputClass =
  'w-full h-14 px-5 rounded-xl border border-[#2A2A2A] bg-[#111111] text-white placeholder-[#444444] outline-none focus:border-[#D4D4D4]/40 transition-colors text-sm'
const labelClass = 'block text-[10px] uppercase tracking-[0.18em] text-[#555555] mb-2'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Please fill in your name, mobile number and message.')
      return
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }
    if (message.trim().length < 5) {
      setError('Please write a slightly longer message.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          message: message.trim(),
          source: 'CONTACT_FORM',
        }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.')
        return
      }

      setSent(true)
      setName('')
      setPhone('')
      setEmail('')
      setMessage('')
    } catch {
      setError('Unable to send your message. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {sent && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5">
          <p className="text-sm text-emerald-400">
            Thank you — your message has been sent. Our team will get back to you shortly.
          </p>
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="contact-name">
          Full Name <span className="text-red-400">*</span>
        </label>
        <input
          id="contact-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
          disabled={submitting}
          className={inputClass}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="contact-phone">
            Mobile Number <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#555555]">+91</span>
            <input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit number"
              maxLength={10}
              inputMode="numeric"
              required
              disabled={submitting}
              className={`${inputClass} pl-12`}
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="contact-email">
            Email (optional)
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={submitting}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="contact-message">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help you?"
          rows={5}
          required
          disabled={submitting}
          className="w-full px-5 py-4 rounded-xl border border-[#2A2A2A] bg-[#111111] text-white placeholder-[#444444] outline-none focus:border-[#D4D4D4]/40 transition-colors text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="luxury-button w-full justify-center disabled:opacity-50"
      >
        {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
        {submitting ? 'Sending…' : 'Submit'}
      </button>
    </form>
  )
}
