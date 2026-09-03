'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ShoppingBag, User, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/component/auth/SessionProvider'
import { useCartStore } from '@/cart/cartStore'
import CartDrawer from '@/component/cart/CartDrawer'
import gsap from 'gsap'

/* ── Navigation data ─────────────────────────────────────────────── */
const navItems = [
  { title: 'Hair Concern',    slug: 'shop-by-hair-concern' },
  { title: 'Extensions',      slug: 'hair-extensions'      },
  { title: 'Wigs',            slug: 'wigs'                 },
  { title: 'Hair Toppers',    slug: 'hair-toppers'         },
  { title: 'Hair Patches',    slug: 'hair-patches'         },
  { title: 'Accessories',     slug: 'accessories'          },
  { title: 'Best Sellers',    slug: 'best-sellers'         },
]

type DropdownItem = { title: string; slug: string }

const dropdownData: Record<string, DropdownItem[]> = {
  'Hair Concern': [
    { title: 'Scalp & Grey Coverage',  slug: 'scalp-thinning-grey-coverage' },
    { title: 'Medical Hair Loss',       slug: 'medical-hair-loss'            },
    { title: 'Receding Hairline',       slug: 'add-length-volume'            },
    { title: 'Add Length & Volume',     slug: 'add-length-volume-color'      },
    { title: 'Curly Hair',              slug: 'curly-hair'                   },
    { title: 'Grey Hair',               slug: 'grey-hair'                    },
  ],
  'Wigs': [
    { title: 'Full Head Wigs',          slug: 'full-head-wigs'              },
    { title: 'Half Head Wigs',          slug: 'half-head-wigs'              },
    { title: 'Deep Curly Wigs',         slug: 'deep-curly-half-head-wigs'   },
    { title: 'Balayage Wigs',           slug: 'balayage-half-head-wigs'     },
    { title: 'V-Part Wigs',             slug: 'v-part-wigs'                 },
  ],
  'Hair Toppers': [
    { title: 'Shop All',                slug: 'shop-all'                                   },
    { title: 'New Base Toppers',        slug: 'new-base-hair-toppers'                     },
    { title: 'Front Hairline Topper',   slug: 'front-hairline-topper-receding-hairline'   },
    { title: 'Mini Topper with Bangs',  slug: 'mini-topper-with-bangs'                    },
    { title: 'Back Comb Toppers',       slug: 'back-comb-hair-toppers'                    },
  ],
}

const announcements = [
  'FREE SHIPPING OVER ₹599',
  'LOVED BY 200,000+ WOMEN',
  'PREMIUM 100% HUMAN HAIR',
  'CASH ON DELIVERY AVAILABLE',
  'EASY 7-DAY RETURNS',
]

/* ── Component ───────────────────────────────────────────────────── */
export default function Header() {
  const router         = useRouter()
  const { isSignedIn } = useSession()
  const openCart       = useCartStore((s) => s.openCart)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileOpen,     setMobileOpen]     = useState(false)

  const navRef      = useRef<HTMLElement>(null)
  const overlayRef  = useRef<HTMLDivElement>(null)
  const mobileItems = useRef<HTMLDivElement>(null)
  const tlRef       = useRef<gsap.core.Timeline | null>(null)
  const lastScrollY = useRef(0)

  /* ── Hide nav on scroll down, reveal on scroll up ── */
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const onScroll = () => {
      const y = window.scrollY
      if (y > lastScrollY.current && y > 80) {
        // scrolling down — slide nav up out of view
        gsap.to(nav, { y: -nav.offsetHeight, duration: 0.38, ease: 'power3.in', overwrite: true })
      } else {
        // scrolling up — slide nav back down
        gsap.to(nav, { y: 0, duration: 0.38, ease: 'power3.out', overwrite: true })
      }
      lastScrollY.current = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Lock body scroll when mobile menu open ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  /* ── GSAP mobile menu timeline ── */
  const openMobileMenu = () => {
    setMobileOpen(true)
    requestAnimationFrame(() => {
      if (!overlayRef.current || !mobileItems.current) return
      const items = mobileItems.current.querySelectorAll('.mobile-nav-link')
      tlRef.current = gsap.timeline()
      tlRef.current
        .fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: 'power2.out' }
        )
        .fromTo(items,
          { opacity: 0, x: -32 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.055 },
          '-=0.15'
        )
    })
  }

  const closeMobileMenu = () => {
    if (!overlayRef.current) { setMobileOpen(false); return }
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => setMobileOpen(false),
    })
  }

  return (
    <>
      {/* ── Announcement ticker — always fixed at very top ─────────── */}
      <div className="fixed top-0 inset-x-0 z-50 overflow-hidden whitespace-nowrap text-[10px] tracking-[0.28em] py-2 font-medium border-b border-[#333333]/40 bg-[#1A1A1A]">
        <div className="animate-marquee flex gap-16">
          {[...announcements, ...announcements].map((t, i) => (
            <span key={i} className="text-[#B8B8B8]">{t} &nbsp;·</span>
          ))}
        </div>
      </div>

      {/* ── Nav bar — slides up on scroll down, back on scroll up ──── */}
      <header
        ref={navRef}
        className="fixed inset-x-0 z-40 bg-[#121212]/92 backdrop-blur-2xl border-b border-[#333333]/60 shadow-[0_4px_40px_rgba(0,0,0,0.4)]"
        style={{ top: 34 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">

            {/* ── Logo ──────────────────────────────────────────── */}
            <Link
              href="/"
              className="font-cormorant text-xl lg:text-[1.375rem] font-bold tracking-[0.16em] uppercase text-white hover:text-[#D4D4D4] transition-colors duration-300 flex-shrink-0"
            >
              Glamorous Thread
            </Link>

            {/* ── Desktop Nav ───────────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-8">
              {navItems.map((item) => {
                const dropdown = dropdownData[item.title]
                return (
                  <div
                    key={item.slug}
                    className="relative"
                    onMouseEnter={() => dropdown && setActiveDropdown(item.title)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={`/collection/${item.slug}`}
                      className="text-[0.78rem] font-medium tracking-[0.06em] uppercase text-[#B8B8B8] hover:text-white transition-colors duration-200 hover-underline flex items-center gap-1"
                    >
                      {item.title}
                      {dropdown && (
                        <svg className="w-2.5 h-2.5 opacity-50 mt-px" viewBox="0 0 10 6" fill="none">
                          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </Link>

                    {/* Dropdown */}
                    {dropdown && activeDropdown === item.title && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-[#1A1A1A]/98 backdrop-blur-xl border border-[#333333] rounded-2xl shadow-luxury p-2 z-50 animate-fade-in">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1A1A1A] border-l border-t border-[#333333] rotate-45" />
                        {dropdown.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/collection/${sub.slug}`}
                            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[0.8125rem] text-[#8A8A8A] hover:text-white hover:bg-[#2A2A2A] transition-all duration-150 group"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <span className="w-1 h-1 rounded-full bg-[#D4D4D4] opacity-0 group-hover:opacity-100 transition-opacity" />
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* ── Action icons ──────────────────────────────────── */}
            <div className="flex items-center gap-4 lg:gap-5">
              <button
                className="hidden md:flex text-[#B8B8B8] hover:text-white transition-colors duration-200"
                aria-label="Search"
              >
                <Search strokeWidth={1.7} className="w-[18px] h-[18px]" />
              </button>

              <button
                onClick={() => router.push(isSignedIn ? '/account' : '/auth/login')}
                className="hidden md:flex text-[#B8B8B8] hover:text-white transition-colors duration-200"
                aria-label="Account"
              >
                <User strokeWidth={1.7} className="w-[18px] h-[18px]" />
              </button>

              <button
                onClick={openCart}
                className="relative text-[#B8B8B8] hover:text-white transition-colors duration-200"
                aria-label="Cart"
              >
                <ShoppingBag strokeWidth={1.7} className="w-[18px] h-[18px]" />
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={mobileOpen ? closeMobileMenu : openMobileMenu}
                className="lg:hidden text-[#B8B8B8] hover:text-white transition-colors duration-200 ml-1"
                aria-label="Toggle menu"
              >
                {mobileOpen
                  ? <X strokeWidth={1.7} className="w-5 h-5" />
                  : (
                    <div className="flex flex-col gap-[5px] w-5">
                      <span className="h-px bg-current w-full transition-all" />
                      <span className="h-px bg-current w-3/4 transition-all" />
                      <span className="h-px bg-current w-full transition-all" />
                    </div>
                  )
                }
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Fullscreen Mobile Menu ────────────────────────────────── */}
      {mobileOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[60] bg-[#121212]/98 backdrop-blur-xl flex flex-col"
          style={{ opacity: 0 }}
        >
          {/* Close button */}
          <div className="flex justify-end px-6 pt-5">
            <button
              onClick={closeMobileMenu}
              className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center text-[#8A8A8A] hover:text-white hover:border-[#D4D4D4] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={mobileItems} className="flex flex-col justify-center px-8 pt-8 pb-16 flex-1 gap-1">
            {/* Brand */}
            <p className="mobile-nav-link font-cormorant text-[2rem] font-bold text-white mb-8 tracking-wide opacity-0">
              Glamorous Thread
            </p>

            {navItems.map((item) => (
              <Link
                key={item.slug}
                href={`/collection/${item.slug}`}
                onClick={closeMobileMenu}
                className="mobile-nav-link opacity-0 group flex items-center justify-between py-4 border-b border-[#222222] last:border-0"
              >
                <span className="text-[1.0625rem] font-medium text-[#B8B8B8] group-hover:text-white tracking-wide transition-colors duration-200">
                  {item.title}
                </span>
                <span className="text-[#333333] group-hover:text-[#D4D4D4] transition-colors">→</span>
              </Link>
            ))}

            {/* Bottom actions */}
            <div className="mobile-nav-link opacity-0 mt-8 flex gap-6 items-center">
              <button
                onClick={() => { closeMobileMenu(); router.push(isSignedIn ? '/account' : '/auth/login') }}
                className="flex items-center gap-2 text-[#8A8A8A] hover:text-white transition-colors text-sm"
              >
                <User className="w-4 h-4" /> Account
              </button>
              <button
                onClick={() => { closeMobileMenu(); openCart() }}
                className="flex items-center gap-2 text-[#8A8A8A] hover:text-white transition-colors text-sm"
              >
                <ShoppingBag className="w-4 h-4" /> Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <CartDrawer />
    </>
  )
}
