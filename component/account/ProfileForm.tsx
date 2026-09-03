'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Same field styling as the checkout form (component/checkout/CheckoutAddress.tsx).
const inputClass =
  'w-full h-14 px-5 rounded-xl border border-[#2A2A2A] bg-[#111111] text-white placeholder-[#444444] outline-none focus:border-[#D4D4D4]/40 transition-colors text-sm'
const labelClass = 'block text-[10px] uppercase tracking-[0.18em] text-[#555555] mb-2'

export interface ProfileValues {
  name: string | null
  phoneNumber: string
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
}

export default function ProfileForm({ user }: { user: ProfileValues }) {
  const router = useRouter()

  const [name, setName] = useState(user.name ?? '')
  const [email, setEmail] = useState(user.email ?? '')
  const [address, setAddress] = useState(user.address ?? '')
  const [city, setCity] = useState(user.city ?? '')
  const [state, setState] = useState(user.state ?? '')
  const [pincode, setPincode] = useState(user.pincode ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address, or leave it blank.')
      return
    }
    if (pincode.trim() && !/^\d{6}$/.test(pincode.trim())) {
      setError('Enter a valid 6-digit pincode, or leave it blank.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, address, city, state, pincode }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const message = data?.error || 'Could not save your profile.'
        setError(message)
        toast.error(message)
        return
      }

      toast.success('Profile updated')
      router.refresh()
    } catch {
      const message = 'Could not save your profile. Please check your connection.'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="profile-name">Name</label>
          <input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            disabled={saving}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-phone">Phone Number</label>
          <input
            id="profile-phone"
            value={user.phoneNumber}
            readOnly
            aria-readonly="true"
            className={`${inputClass} cursor-not-allowed text-[#8A8A8A]`}
          />
          <p className="mt-1.5 text-[10px] text-[#555555]">Used to sign in — cannot be changed here.</p>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="profile-email">Email</label>
        <input
          id="profile-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={saving}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="profile-address">Address</label>
        <input
          id="profile-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Flat / House no., Street, Area"
          disabled={saving}
          className={inputClass}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="profile-city">City</label>
          <input
            id="profile-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            disabled={saving}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-state">State</label>
          <input
            id="profile-state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="State"
            disabled={saving}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-pincode">Pincode</label>
          <input
            id="profile-pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="6-digit pincode"
            maxLength={6}
            inputMode="numeric"
            disabled={saving}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="luxury-button w-full justify-center disabled:opacity-50 sm:w-auto"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : null}
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
