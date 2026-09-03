'use client'

import { useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import ConfirmButton from '@/component/admin/ConfirmButton'
import CouponForm from './CouponForm'
import type { CouponRow } from './types'

export default function CouponActions({ coupon }: { coupon: CouponRow }) {
  const [editing, setEditing] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[#9CA3AF] hover:text-white transition-colors"
          aria-label="Edit coupon"
        >
          <Pencil size={15} />
        </button>
        <ConfirmButton
          url={`/api/admin/coupons/${coupon.id}`}
          method="DELETE"
          confirmMessage={`Delete coupon "${coupon.code}"? This cannot be undone.`}
          className="text-[#9CA3AF] hover:text-red-400 transition-colors"
        >
          <Trash2 size={15} />
        </ConfirmButton>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Edit Coupon</h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-[#6B7280] hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <CouponForm coupon={coupon} onDone={() => setEditing(false)} />
          </div>
        </div>
      )}
    </>
  )
}
