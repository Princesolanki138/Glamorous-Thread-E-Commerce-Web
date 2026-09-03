'use client'

import { create } from 'zustand'

type CheckoutFields = {
  firstName: string
  lastName:  string
  phone:     string
  email:     string
  line1:     string
  line2:     string
  city:      string
  state:     string
  pincode:   string
  country:   string
  notes:     string
}

/** An applied discount code. The amount is always re-verified server-side. */
export type AppliedCoupon = {
  code:     string
  discount: number
}

type CheckoutStore = CheckoutFields & {
  coupon:             AppliedCoupon | null
  updateField:        (field: keyof CheckoutFields, value: string) => void
  applyCoupon:        (coupon: AppliedCoupon | null) => void
  reset:              () => void
  isShippingComplete: () => boolean
}

const initial: CheckoutFields = {
  firstName: '',
  lastName:  '',
  phone:     '',
  email:     '',
  line1:     '',
  line2:     '',
  city:      '',
  state:     '',
  pincode:   '',
  country:   'India',
  notes:     '',
}

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  ...initial,
  coupon: null,

  updateField: (field, value) => set({ [field]: value } as Pick<CheckoutFields, keyof CheckoutFields>),

  applyCoupon: (coupon) => set({ coupon }),

  reset: () => set({ ...initial, coupon: null }),

  isShippingComplete: () => {
    const s = get()
    return [s.firstName, s.lastName, s.phone, s.line1, s.city, s.state, s.pincode]
      .every(v => v.trim().length > 0)
  },
}))
