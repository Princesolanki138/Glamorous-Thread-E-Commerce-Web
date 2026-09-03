'use client'

import { useState } from 'react'
import { MapPin, AlertCircle } from 'lucide-react'
import { useCheckoutStore } from '@/cart/checkoutStore'

type Props = { onContinue: () => void }

const inputClass =
  'w-full h-14 px-5 rounded-xl border border-[#2A2A2A] bg-[#111111] text-white placeholder-[#444444] outline-none focus:border-[#D4D4D4]/40 transition-colors text-sm'

const labelClass = 'block text-[10px] uppercase tracking-[0.18em] text-[#555555] mb-2'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
]

export default function CheckoutAddress({ onContinue }: Props) {
  const { firstName, lastName, phone, email, line1, line2, city, state, pincode, notes, updateField } =
    useCheckoutStore()

  const [error, setError] = useState<string | null>(null)

  const handleContinue = () => {
    setError(null)
    if (!firstName || !lastName || !phone || !line1 || !city || !state || !pincode) {
      setError('Please fill in all required fields')
      return
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    if (!/^\d{6}$/.test(pincode)) {
      setError('Enter a valid 6-digit pincode')
      return
    }
    onContinue()
  }

  return (
    <div className="max-w-xl">
      <div className="section-label mb-3">Step 1 of 2</div>
      <h1 className="font-cormorant text-4xl text-white tracking-tight">Shipping Details</h1>
      <p className="text-[#8A8A8A] text-sm mt-2 mb-10">Tell us where to deliver your order.</p>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 mb-6">
          <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            <input value={firstName} onChange={e => updateField('firstName', e.target.value)}
              placeholder="First name" className={inputClass} />
            <input value={lastName} onChange={e => updateField('lastName', e.target.value)}
              placeholder="Last name" className={inputClass} />
          </div>
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Phone <span className="text-red-400">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#555555]">+91</span>
              <input value={phone} onChange={e => updateField('phone', e.target.value)}
                placeholder="10-digit number" maxLength={10} className={`${inputClass} pl-12`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email (optional)</label>
            <input value={email} onChange={e => updateField('email', e.target.value)}
              placeholder="your@email.com" type="email" className={inputClass} />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={labelClass}>Address Line 1 <span className="text-red-400">*</span></label>
          <input value={line1} onChange={e => updateField('line1', e.target.value)}
            placeholder="Flat / House no., Street, Area" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Address Line 2 (optional)</label>
          <input value={line2} onChange={e => updateField('line2', e.target.value)}
            placeholder="Landmark, Apartment, etc." className={inputClass} />
        </div>

        {/* City / State / PIN */}
        <div>
          <label className={labelClass}>City, State &amp; Pincode <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-3 gap-3">
            <input value={city} onChange={e => updateField('city', e.target.value)}
              placeholder="City" className={inputClass} />
            <select value={state} onChange={e => updateField('state', e.target.value)}
              className={`${inputClass} cursor-pointer`}>
              <option value="" className="bg-[#111111]">State</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s} className="bg-[#111111]">{s}</option>
              ))}
            </select>
            <input value={pincode} onChange={e => updateField('pincode', e.target.value)}
              placeholder="Pincode" maxLength={6} className={inputClass} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Order Notes (optional)</label>
          <textarea value={notes} onChange={e => updateField('notes', e.target.value)}
            placeholder="Any special instructions for your order…"
            rows={3}
            className="w-full px-5 py-4 rounded-xl border border-[#2A2A2A] bg-[#111111] text-white placeholder-[#444444] outline-none focus:border-[#D4D4D4]/40 transition-colors text-sm resize-none" />
        </div>

        {/* CTA */}
        <div className="pt-2">
          <button onClick={handleContinue}
            className="luxury-button w-full h-14 justify-center text-sm tracking-widest uppercase flex items-center gap-2">
            <MapPin size={15} strokeWidth={1.5} />
            Continue to Review Order
          </button>
        </div>
      </div>
    </div>
  )
}
