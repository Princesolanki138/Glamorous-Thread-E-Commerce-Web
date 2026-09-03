import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
import AccountHeader from '@/component/layout/AccountHeader'
import { Footer } from '@/component/layout/Footer'
import ProfileForm from '@/component/account/ProfileForm'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View and update your personal information.',
}

export default async function UserProfilePage() {
  const session = await getSession()
  if (!session) redirect('/auth/login?redirect_url=%2Fuser-profile')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      phoneNumber: true,
      email: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
      isAdmin: true,
    },
  })

  // The session cookie outlived the user record.
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <AccountHeader />

      <main className="px-4 sm:px-6 lg:px-12 py-16">
        <div className="max-w-3xl mx-auto">

          <Link
            href="/account"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[#8A8A8A] transition-colors hover:text-white"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            Back to My Orders
          </Link>

          <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">My Profile</h1>
              <p className="mt-2 text-[#9CA3AF]">
                Keep your details up to date so orders reach you faster.
              </p>
            </div>

            {user.isAdmin && (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-5 py-3 text-sm text-[#D4D4D4] transition-colors hover:border-[#D4D4D4]/40 hover:text-white"
              >
                <ShieldCheck size={15} strokeWidth={1.5} />
                Go to Admin Panel
              </Link>
            )}
          </div>

          <div className="luxury-card p-6 sm:p-8">
            <ProfileForm user={user} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
