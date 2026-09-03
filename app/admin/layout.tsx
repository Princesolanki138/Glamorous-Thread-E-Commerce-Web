import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

const navigation = [
  { name: 'Dashboard',          href: '/admin/dashboard' },
  { name: 'Products',           href: '/admin/products' },
  { name: 'Collections',        href: '/admin/categories' },
  { name: 'Orders',             href: '/admin/orders' },
  { name: 'Customers',          href: '/admin/customers' },
  { name: 'Leads (CRM)',        href: '/admin/leads' },
  { name: 'Inventory',          href: '/admin/inventory-alerts' },
  { name: 'Reviews',            href: '/admin/reviews' },
  { name: 'Wishlist Analytics', href: '/admin/wishlist' },
  { name: 'Audit Logs',         href: '/admin/audit' },
  { name: 'Settings',           href: '/admin/settings' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const dbUser = await prisma.user.findUnique({ where: { id: session.userId } })
  // Signed in but not an admin: bounce to the account area rather than the
  // login page, which would look broken to someone already logged in.
  if (!dbUser?.isAdmin) redirect('/account')

  const adminName = dbUser.name || 'Admin'
  const initials =
    (dbUser.name?.trim()?.[0] || dbUser.phoneNumber.slice(-2, -1) || 'A').toUpperCase()

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <div className="flex">

        {/* Sidebar */}
        <aside className="hidden w-65 flex-col border-r border-[#1F1F1F] bg-[#0D0D0D] lg:flex fixed h-screen z-50">

          {/* Logo */}
          <div className="flex h-18 items-center border-b border-[#1F1F1F] px-7">
            <Link href="/admin/dashboard" className="text-xl font-bold tracking-[0.22em] text-white uppercase">
              GH Admin
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-xl px-4 py-2.5 text-sm font-medium text-[#9CA3AF] transition-all hover:bg-[#1A1A1A] hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Admin Card */}
          <div className="border-t border-[#1F1F1F] p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-[#141414] border border-[#1F1F1F] p-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#1F1F1F] shrink-0">
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#BFC0C2]">
                  {initials}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{adminName}</p>
                <p className="truncate text-xs text-[#6B7280]">{dbUser.email || dbUser.phoneNumber}</p>
                <p className="mt-0.5 text-xs font-medium text-[#BFC0C2]">Administrator</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex min-h-screen flex-1 flex-col lg:pl-65">

          {/* Topbar */}
          <header className="sticky top-0 z-40 flex h-18 items-center justify-between border-b border-[#1F1F1F] bg-brand-bg/95 backdrop-blur-sm px-6">
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-[#6B7280] mt-0.5">Glamorous Thread · Store Management</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">{adminName}</p>
                <p className="text-xs text-[#6B7280]">Administrator</p>
              </div>
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#1F1F1F] border border-[#262626]">
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#BFC0C2]">
                  {initials}
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
