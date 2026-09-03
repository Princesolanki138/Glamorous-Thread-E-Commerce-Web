// Serializable row shapes passed from the Settings server page down to
// client components. Date fields are formatted to ISO strings server-side
// before crossing the boundary (kept as plain strings throughout the client
// tree for consistency).

export type CouponRow = {
  id: string
  code: string
  discountType: string
  discountValue: number
  minOrderAmount: number | null
  usageLimit: number | null
  usedCount: number
  isActive: boolean
  startsAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}
