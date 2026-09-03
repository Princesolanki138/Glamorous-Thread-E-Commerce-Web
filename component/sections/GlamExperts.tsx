'use client'

import React, { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const experts = [
  {
    name: 'Amir Shaikh',
    role: 'Hair Extension Specialist',
    bio: 'With over a decade crafting bespoke hair solutions, Amir brings precision and artistry to every transformation.',
    image: '/images/amir-shaikh.jpg',
    initials: 'AS',
    tag: '10+ Years Experience',
  },
  {
    name: 'Rafiya Shaikh',
    role: 'Hair Transformation Expert',
    bio: 'Rafiya\'s mastery of colour, texture and styling has made her the trusted choice for over 5,000 clients across India.',
    image: '/images/rafiya-shaikh.jpg',
    initials: 'RS',
    tag: '5,000+ Clients',
  },
]

function ExpertCard({ expert, index }: { expert: typeof experts[0]; index: number }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="expert-card group relative overflow-hidden rounded-3xl border border-[#2A2A2A] bg-[#111111] hover:border-[#D4D4D4]/20 transition-all duration-500"
      style={{ opacity: 0, transform: 'translateY(48px)' }}
    >
      {/* Portrait */}
      <div className="relative h-[480px] sm:h-[540px] w-full overflow-hidden bg-[#1A1A1A]">
        {!imgError ? (
          <Image
            src={expert.image}
            alt={expert.name}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Placeholder when image is missing */
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <div className="w-28 h-28 rounded-full border border-[#2A2A2A] bg-[#222222] flex items-center justify-center">
              <span className="font-cormorant text-4xl text-[#D4D4D4]">{expert.initials}</span>
            </div>
            <p className="text-[#444444] text-xs uppercase tracking-widest">Photo Coming Soon</p>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-[#111111] via-[#111111]/20 to-transparent" />

        {/* Tag chip */}
        <div className="absolute top-5 left-5">
          <span className="inline-flex items-center rounded-full border border-[#D4D4D4]/20 bg-[#121212]/80 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-widest text-[#D4D4D4]">
            {expert.tag}
          </span>
        </div>

        {/* Index number */}
        <div className="absolute top-5 right-5 w-9 h-9 rounded-full border border-[#2A2A2A] bg-[#121212]/80 backdrop-blur-md flex items-center justify-center">
          <span className="font-cormorant text-base text-[#555555]">0{index + 1}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-cormorant text-2xl text-white leading-tight">{expert.name}</h3>
            <p className="text-[#D4D4D4] text-xs uppercase tracking-[0.18em] mt-1">{expert.role}</p>
          </div>
          {/* Decorative line accent */}
          <div className="shrink-0 w-8 h-px bg-[#D4D4D4]/30 mt-3" />
        </div>
        <p className="text-[#8A8A8A] text-sm leading-relaxed mt-4 font-inter">{expert.bio}</p>
      </div>
    </div>
  )
}

export const GlamExperts: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo('.ge-header',
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.ge-header', start: 'top 85%', once: true },
        }
      )

      gsap.fromTo('.expert-card',
        { opacity: 0, y: 48 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.18,
          scrollTrigger: { trigger: '.ge-grid', start: 'top 80%', once: true },
        }
      )

      gsap.fromTo('.ge-footer',
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.ge-footer', start: 'top 88%', once: true },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-28 bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="ge-header text-center mb-16" style={{ opacity: 0 }}>
          <p className="section-label mb-5 justify-center">The Glam Experts</p>
          <h2 className="font-cormorant text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold text-white leading-[1.08]">
            Masters of Hair
            <span className="block gradient-text">&amp; Style</span>
          </h2>
          <p className="text-[#8A8A8A] mt-5 text-base max-w-xl mx-auto font-inter leading-relaxed">
            Meet the specialists behind every transformation — combining years of expertise
            with a passion for natural, confidence-restoring results.
          </p>
        </div>

        {/* Expert Cards */}
        <div className="ge-grid grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {experts.map((expert, i) => (
            <ExpertCard key={expert.name} expert={expert} index={i} />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="ge-footer mt-16 pt-12 border-t border-[#1E1E1E] flex flex-col sm:flex-row items-center justify-between gap-6" style={{ opacity: 0 }}>
          <div>
            <p className="font-cormorant text-xl text-white">Want a personalised consultation?</p>
            <p className="text-[#8A8A8A] text-sm mt-1 font-inter">
              Book a 1-on-1 session with our hair experts — online or at our studio.
            </p>
          </div>
          <a
            href="https://wa.me/918104834173?text=Hi%20Glamorous%20Thread!%20I%E2%80%99d%20like%20to%20book%20a%20consultation."
            target="_blank"
            rel="noreferrer"
            className="luxury-button shrink-0"
          >
            Book a Consultation
          </a>
        </div>

      </div>
    </section>
  )
}
