'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession } from '@/component/auth/SessionProvider'
import { usePathname } from 'next/navigation'
import { gsap } from '@/lib/gsap'

const AccountHeader = () => {
  const pathname = usePathname()
  const { user, signOut } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      if (y > lastScrollY.current && y > 80) {
        gsap.to(header, { yPercent: -100, duration: 0.35, ease: 'power3.in' })
      } else {
        gsap.to(header, { yPercent: 0, duration: 0.35, ease: 'power3.out' })
      }
      lastScrollY.current = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkClass = (path: string) =>
    `relative text-[0.72rem] uppercase tracking-[0.1em] font-medium transition-colors duration-200 pb-0.5 ${
      pathname.startsWith(path)
        ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[#D4D4D4]'
        : 'text-[#8A8A8A] hover:text-[#D4D4D4]'
    }`

  return (
    <header
      ref={headerRef}
      className={`fixed w-full top-0 z-50 transition-[background,border,box-shadow] duration-300 ${
        scrolled
          ? 'bg-[#121212]/92 backdrop-blur-2xl border-b border-[#333333]/60 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-[#121212] border-b border-[#222222]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between gap-8">

        {/* Brand */}
        <Link
          href="/"
          className="font-cormorant text-[1.25rem] tracking-[0.18em] uppercase text-white hover:text-[#D4D4D4] transition-colors shrink-0"
        >
          Glamorous Thread
        </Link>

        {/* Nav Links */}
        <nav className="hidden sm:flex items-center gap-7">
          <Link href="/account" className={linkClass('/account')}>
            Orders
          </Link>
          <Link href="/return-exchange" className={linkClass('/return-exchange')}>
            Returns
          </Link>
          <Link href="/shipping-delivery" className={linkClass('/shipping-delivery')}>
            Shipping
          </Link>
          <Link href="/contact-us" className={linkClass('/contact-us')}>
            Contact
          </Link>
        </nav>

        {/* User Button */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#333333] bg-[#2A2A2A] flex items-center justify-center text-[0.7rem] font-semibold text-[#D4D4D4]">
            {user?.phoneNumber?.slice(-2) ?? 'GT'}
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-[0.72rem] uppercase tracking-[0.1em] font-medium text-[#8A8A8A] hover:text-[#D4D4D4] transition-colors duration-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}

export default AccountHeader
