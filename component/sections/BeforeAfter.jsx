'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Link from 'next/link'

const videos = [
  { src: '/hair-demo.mp4', title: 'Hair Transformation', slug: 'hair-extensions' },
  { src: '/hair-demo.mp4', title: 'Hair Band Topper',    slug: 'hair-toppers'    },
  { src: '/hair-demo.mp4', title: 'Hair Styling',        slug: 'wigs'            },
]

export default function BeforeAfter() {
  const [index, setIndex] = useState(1)

  const prev = () => setIndex((i) => (i - 1 + videos.length) % videos.length)
  const next = () => setIndex((i) => (i + 1) % videos.length)

  return (
    <section className="py-28 bg-[#121212] flex flex-col items-center overflow-hidden relative">

      {/* Background glow */}
      <div className="absolute w-[600px] h-[600px] bg-[#D4D4D4]/4 blur-[140px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-2xl mb-16 px-4"
      >
        <p className="section-label text-[#D4D4D4] mb-5 justify-center">Real Results</p>
        <h2 className="font-cormorant text-[clamp(3rem,7vw,5.5rem)] font-bold text-white tracking-tight leading-[0.95] mb-5">
          Before.{' '}
          <span className="gradient-text">After.</span>
        </h2>
        <div className="w-10 h-px bg-brand-border mx-auto mb-6" />
        <p className="text-[#8A8A8A] text-base leading-relaxed font-inter">
          Same woman. Same scalp.{' '}
          <span className="text-white font-medium">Just the right solution.</span>
        </p>
      </motion.div>

      {/* Slider */}
      <div className="relative flex items-center justify-center w-full">

        {/* Prev */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-4 sm:left-8 z-20 w-12 h-12 bg-[#1A1A1A] border border-brand-border backdrop-blur rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-white hover:border-[#D4D4D4]/40 transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Cards */}
        <div className="flex gap-5 items-center">
          {videos.map((video, i) => {
            const isActive = i === index
            return (
              <motion.div
                key={i}
                animate={{
                  scale:   isActive ? 1 : 0.82,
                  opacity: isActive ? 1 : 0.3,
                  rotateY: isActive ? 0 : i < index ? 12 : -12,
                }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-3xl overflow-hidden"
                style={{
                  width:     isActive ? '320px' : '240px',
                  height:    isActive ? '500px' : '400px',
                  boxShadow: isActive
                    ? '0 32px 80px rgba(0,0,0,0.8)'
                    : '0 8px 24px rgba(0,0,0,0.4)',
                  border: isActive
                    ? '1px solid rgba(212,212,212,0.22)'
                    : '1px solid rgba(51,51,51,0.6)',
                }}
              >
                <video
                  ref={(el) => {
                    if (el) {
                      if (isActive) el.play().catch(() => {})
                      else { el.pause(); el.currentTime = 0 }
                    }
                  }}
                  src={video.src}
                  className="w-full h-full object-cover"
                  muted loop playsInline preload="none"
                />

                <div className="absolute inset-0 bg-linear-to-t from-[#121212]/90 via-transparent to-transparent" />

                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-sm p-4 rounded-full border border-white/10">
                      <Play size={22} className="text-white fill-white" />
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white text-sm font-semibold mb-3 font-inter">{video.title}</p>
                  {isActive && (
                    <Link
                      href={`/collection/${video.slug}`}
                      className="block w-full bg-white text-[#121212] py-2.5 rounded-xl text-xs font-semibold text-center uppercase tracking-wider hover:bg-[#D4D4D4] transition-colors font-inter"
                    >
                      Shop Collection
                    </Link>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Next */}
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-4 sm:right-8 z-20 w-12 h-12 bg-[#1A1A1A] border border-brand-border backdrop-blur rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-white hover:border-[#D4D4D4]/40 transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-2 mt-10">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === index ? 'w-6 h-2 bg-[#D4D4D4]' : 'w-2 h-2 bg-[#2A2A2A] hover:bg-[#5C5C5C]'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
