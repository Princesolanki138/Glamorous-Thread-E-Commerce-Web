import { prisma } from '@/lib/prisma'
import { Tag } from 'lucide-react'
import CouponsTable from './CouponsTable'
import CouponForm from './CouponForm'
import type { CouponRow } from './types'

export default async function AdminSettingsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })

  const couponRows: CouponRow[] = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderAmount: c.minOrderAmount,
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    isActive: c.isActive,
    startsAt: c.startsAt ? c.startsAt.toISOString() : null,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[#6B7280] mt-1">Manage discount coupons.</p>
      </div>

      {/* Coupons */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Tag size={18} className="text-[#9CA3AF]" />
            <h2 className="text-lg font-semibold text-white">Coupons</h2>
            <span className="text-xs text-[#6B7280]">
              {coupons.length} coupon{coupons.length !== 1 ? 's' : ''}
            </span>
          </div>
          <CouponForm />
        </div>
        <CouponsTable coupons={couponRows} />
      </section>
    </div>
  )
}
