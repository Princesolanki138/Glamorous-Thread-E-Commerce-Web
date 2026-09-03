'use client'

import ConfirmButton from '@/component/admin/ConfirmButton'

export default function AdminRoleToggle({
  userId,
  isAdmin,
}: {
  userId: string
  isAdmin: boolean
}) {
  return (
    <ConfirmButton
      url={`/api/admin/customers/${userId}`}
      method="PATCH"
      body={{ isAdmin: !isAdmin }}
      confirmMessage={
        isAdmin
          ? 'Revoke admin access from this user?'
          : 'Grant admin access to this user?'
      }
      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
        isAdmin
          ? 'border border-[#2A2A2A] bg-[#1A1A1A] text-[#D1D5DB] hover:text-white'
          : 'bg-white text-black hover:bg-[#E5E5E5]'
      }`}
    >
      {isAdmin ? 'Revoke Admin Access' : 'Grant Admin Access'}
    </ConfirmButton>
  )
}
