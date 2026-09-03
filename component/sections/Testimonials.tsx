'use client'

import React, { useRef, useEffect } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { StorefrontTestimonial } from '@/lib/products'

gsap.registerPlugin(ScrollTrigger)

export const Testimonials: React.FC<{ testimonials: StorefrontTestimonial[] }> = ({
  testimonials,
}) => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo('.t-header',
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: '.t-header', start: 'top 85%', once: true },
        }
      )
      gsap.fromTo('.t-card',
        { opacity: 0, y: 56 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.13,
          scrollTrigger: { trigger: '.t-grid', start: 'top 80%', once: true },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  if (testimonials.length === 0) return null

  return (
    <section ref={sectionRef} className="py-28 bg-[#0E0E0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="t-header text-center mb-16" style={{ opacity: 0 }}>
          <p className="section-label text-[#D4D4D4] mb-5 justify-center">Real Stories</p>
          <h2 className="font-cormorant text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold text-white leading-[1.08]">
            Trusted by Women
            <span className="block gradient-text">Like You</span>
          </h2>
          <p className="text-[#8A8A8A] mt-5 text-base max-w-lg mx-auto font-inter">
            14,000+ verified reviews. Real transformations, real confidence.
          </p>
        </div>

        {/* Cards */}
        <div className="t-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="t-card bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-7 flex flex-col gap-5 hover:border-[#D4D4D4]/30 transition-colors duration-300"
              style={{ opacity: 0 }}
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} className="w-3.5 h-3.5 fill-[#D4D4D4] text-[#D4D4D4]" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-[#B8B8B8] text-[0.9375rem] leading-relaxed font-inter flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#2A2A2A]">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#333333] flex-shrink-0">
                  <Image src={t.image} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold font-inter">{t.name}</p>
                  <p className="text-[#5C5C5C] text-xs font-inter mt-0.5">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof row */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-10 pt-10 border-t border-[#1E1E1E]">
          {[
            { value: '14,000+', label: 'Verified Reviews' },
            { value: '★ 4.9',   label: 'Average Rating'  },
            { value: '200K+',   label: 'Happy Customers' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-cormorant text-[2rem] font-bold text-white">{s.value}</p>
              <p className="text-[#8A8A8A] text-xs uppercase tracking-[0.18em] mt-1 font-inter">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
