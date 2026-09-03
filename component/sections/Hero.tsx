'use client'

import React, { useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const badges = [
  { value: '200K+',  label: 'Happy Women' },
  { value: '100%',   label: 'Human Hair'  },
  { value: '★ 4.9',  label: '14K Reviews' },
  { value: '7-Day',  label: 'Easy Returns' },
]

export const Hero: React.FC = () => {
  const sectionRef  = useRef<HTMLElement>(null)
  const contentRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 })

      // Label fade in
      tl.fromTo('.hero-label',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      )

      // Each word drops in with slight skew
      .fromTo('.hero-word',
        { opacity: 0, y: 80, skewY: 4 },
        {
          opacity: 1, y: 0, skewY: 0,
          duration: 1.0,
          ease: 'power4.out',
          stagger: 0.1,
        },
        '-=0.35'
      )

      // Subtitle
      .fromTo('.hero-sub',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
        '-=0.45'
      )

      // CTA buttons
      .fromTo('.hero-cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        '-=0.4'
      )

      // Stats row
      .fromTo('.hero-stat',
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
          stagger: 0.08,
        },
        '-=0.3'
      )

      // Scroll indicator
      .fromTo('.hero-scroll',
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        '-=0.2'
      )

      // Parallax on scroll
      gsap.to(contentRef.current, {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Background parallax (slower)
      gsap.to('.hero-bg', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#121212]"
      aria-label="Hero"
    >
      {/* ── Background image ───────────────────────────────────── */}
      <div className="hero-bg absolute inset-0 z-0 scale-[1.08]">
        <Image
          src="/hero-banner.png"
          alt="Glamorous Thread — Crafted for Confident Women"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/95 via-[#121212]/65 to-[#121212]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212]/30" />
      </div>

      {/* ── Decorative vertical lines ───────────────────────────── */}
      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-[18%] w-px h-full bg-gradient-to-b from-transparent via-[#D4D4D4]/15 to-transparent" />
        <div className="absolute top-0 right-[28%] w-px h-full bg-gradient-to-b from-transparent via-[#D4D4D4]/10 to-transparent hidden lg:block" />
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div
        ref={contentRef}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-36 pb-28"
      >
        <div className="max-w-2xl xl:max-w-3xl">

          {/* Label */}
          <p className="hero-label section-label opacity-0 mb-10 text-[#D4D4D4]">
            Premium Hair Solutions
          </p>

          {/* Main heading — word-by-word reveal */}
          <div className="overflow-hidden mb-0">
            <h1 className="font-cormorant text-[clamp(3.8rem,9vw,7.5rem)] font-bold leading-[0.92] tracking-tight text-white">
              <span className="hero-word inline-block opacity-0">Crafted</span>{' '}
              <span className="hero-word inline-block opacity-0">for</span>
              <br />
              <span className="hero-word inline-block opacity-0 gradient-text">Confident</span>{' '}
              <span
                className="hero-word inline-block opacity-0 gradient-text"
              >
                Women
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="hero-sub opacity-0 mt-8 text-[#B8B8B8] text-base md:text-lg max-w-lg leading-relaxed font-inter">
            Clinically comfortable &middot; 100% Human Hair &middot; Designed for daily wear
          </p>

          {/* CTAs */}
          <div className="hero-cta opacity-0 flex flex-col sm:flex-row gap-4 mt-12">
            <Link
              href="/collection"
              className="luxury-button text-[0.8125rem] gap-2.5"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            <Link
              href="/contact-us"
              className="luxury-button-outline text-[0.8125rem]"
            >
              Free Consultation
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 pt-8 border-t border-white/10 flex flex-wrap gap-10 sm:gap-14">
            {badges.map((b) => (
              <div key={b.label} className="hero-stat opacity-0">
                <p className="font-cormorant text-[1.875rem] font-bold text-white leading-none">
                  {b.value}
                </p>
                <p className="text-[#8A8A8A] text-[0.65rem] uppercase tracking-[0.2em] mt-1.5 font-inter">
                  {b.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ────────────────────────────────────── */}
      <div className="hero-scroll opacity-0 absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2.5">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-[#D4D4D4]/60" />
        <p className="text-[#8A8A8A] text-[0.6rem] uppercase tracking-[0.35em] font-inter">Scroll</p>
      </div>
    </section>
  )
}
