'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { Shield, Sparkles, Heart, Award } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const trustPoints = [
  {
    icon: Shield,
    title: '100% Real Human Hair',
    description: 'Looks natural. Feels like you.',
  },
  {
    icon: Sparkles,
    title: 'All Day Comfort',
    description: 'Lightweight & breathable for daily wear.',
  },
  {
    icon: Heart,
    title: 'Crafted with Love',
    description: 'Handmade with precision & care.',
  },
  {
    icon: Award,
    title: 'Clinically Tested',
    description: 'Safe for sensitive scalps.',
  },
]

export const TrustSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.ts-header',
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: '.ts-header', start: 'top 85%', once: true },
        }
      )
      gsap.fromTo('.ts-card',
        { opacity: 0, y: 48 },
        {
          opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: '.ts-grid', start: 'top 80%', once: true },
        }
      )
      gsap.fromTo('.ts-cta',
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: '.ts-cta', start: 'top 88%', once: true },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-28 overflow-hidden">

      {/* Video background */}
      <video
        autoPlay muted loop playsInline preload="none"
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src="/hair-demo.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#121212]/78 backdrop-blur-[3px]" />

      {/* Noise texture overlay for depth */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="ts-header text-center mb-16 text-white" style={{ opacity: 0 }}>
          <p className="section-label text-[#D4D4D4] mb-5 justify-center">Why Choose Us</p>
          <h2 className="font-cormorant text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold leading-[1.08]">
            Confidence That Feels
            <span className="block gradient-text">Completely Yours</span>
          </h2>
          <p className="text-[#B8B8B8] mt-5 text-base max-w-xl mx-auto font-inter">
            Trusted by thousands of women for comfort, confidence, and natural beauty.
          </p>
        </div>

        {/* Cards */}
        <div className="ts-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustPoints.map((point, i) => (
            <div
              key={i}
              className="ts-card bg-white/6 backdrop-blur-md border border-white/10 rounded-2xl p-7 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              style={{ opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4D4D4]/10 border border-[#D4D4D4]/20 flex items-center justify-center mx-auto mb-5">
                <point.icon className="w-5 h-5 text-[#D4D4D4]" />
              </div>
              <h3 className="text-white text-base font-semibold mb-2 font-inter">{point.title}</h3>
              <p className="text-[#B8B8B8] text-sm leading-relaxed font-inter">{point.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="ts-cta text-center mt-14" style={{ opacity: 0 }}>
          <Link href="/contact-us" className="luxury-button">
            Book Free Consultation
          </Link>
        </div>
      </div>
    </section>
  )
}
