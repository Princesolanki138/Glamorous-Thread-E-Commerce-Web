'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Card geometry drives the carousel transform. Keep in sync with the card's
// w-75 (300px) and the track's gap-6 (24px).
const CARD_WIDTH = 300
const CARD_GAP = 24
const STEP = CARD_WIDTH + CARD_GAP

/**
 * @typedef {object} Demo
 * @property {string} id
 * @property {string} title
 * @property {string} videoUrl
 * @property {string | null} posterUrl
 * @property {string} collectionSlug
 */

/**
 * Homepage "Product Demo" carousel.
 *
 * `demos` comes from the database (Admin → Product Demos); each entry carries a
 * Cloudinary video, an optional poster and the collection it links to. The
 * section renders nothing until at least one active demo exists.
 *
 * @param {{ demos?: Demo[] }} props
 */
export default function ProductDemo({ demos = [] }) {
  const [index, setIndex] = useState(() => Math.floor(demos.length / 2))
  const videoRefs = useRef([])

  const count = demos.length
  const prev = () => setIndex((i) => (i - 1 + count) % count)
  const next = () => setIndex((i) => (i + 1) % count)

  // Only the centred clip plays. Others are paused and rewound, so a card
  // restarts from the beginning whenever the carousel returns to it — which it
  // does on every lap, since each clip advances the carousel when it ends.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      if (i === index) {
        // Autoplay can still be refused by the browser; the poster then stands in.
        video.play().catch(() => {})
      } else {
        video.pause()
        video.currentTime = 0
      }
    })
  }, [index])

  if (count === 0) return null

  // Shift the track so card `index` lands on the container's centre line.
  const trackX = -(index - (count - 1) / 2) * STEP

  return (
    <section className="py-28 bg-[#121212] flex flex-col items-center overflow-hidden relative">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-2xl mb-16 px-4"
      >
        <p className="section-label text-[#D4D4D4] mb-5 justify-center">
          Product Showcase
        </p>

        <h2 className="font-cormorant text-[clamp(3rem,7vw,5.5rem)] font-bold text-white tracking-tight leading-[0.95] mb-5">
          Product{' '}
          <span className="gradient-text">Demo</span>
        </h2>

        <div className="w-10 h-px bg-brand-border mx-auto mb-6" />

        <p className="text-[#8A8A8A] text-base leading-relaxed font-inter">
          See how our products work in real life.{' '}
          <span className="text-white font-medium">
            Real usage. Real results.
          </span>
        </p>
      </motion.div>

      {/* Slider */}
      <div className="relative flex items-center justify-center w-full">

        {count > 1 && (
          <button
            onClick={prev}
            aria-label="Previous demo"
            className="absolute left-4 sm:left-8 z-20 w-12 h-12 bg-[#1A1A1A] border border-brand-border rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-white hover:border-[#D4D4D4]/40 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div className="w-full overflow-hidden">
          <div className="flex justify-center">
            <motion.div
              className="flex gap-6 w-max"
              animate={{ x: trackX }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            >
              {demos.map((demo, i) => {
                const isActive = i === index
                return (
                  <motion.div
                    key={demo.id}
                    className="relative w-75 shrink-0 aspect-3/4 rounded-3xl overflow-hidden bg-[#1A1A1A] border border-brand-border"
                    animate={{ scale: isActive ? 1 : 0.9, opacity: isActive ? 1 : 0.45 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <video
                      ref={(el) => { videoRefs.current[i] = el }}
                      src={demo.videoUrl}
                      poster={demo.posterUrl ?? undefined}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      // A lone demo has nothing to advance to, so it loops
                      // instead of freezing on its last frame.
                      loop={count === 1}
                      playsInline
                      preload="metadata"
                      onEnded={() => { if (isActive) next() }}
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent p-5">
                      <p className="text-white text-sm font-semibold mb-3">
                        {demo.title}
                      </p>

                      {isActive && (
                        <Link
                          href={`/collection/${demo.collectionSlug}`}
                          className="block w-full bg-white text-black py-2.5 rounded-xl text-xs font-semibold text-center uppercase hover:bg-[#D4D4D4] transition-colors"
                        >
                          View Product
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>

        {count > 1 && (
          <button
            onClick={next}
            aria-label="Next demo"
            className="absolute right-4 sm:right-8 z-20 w-12 h-12 bg-[#1A1A1A] border border-brand-border rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-white hover:border-[#D4D4D4]/40 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Position indicators */}
      {count > 1 && (
        <div className="flex items-center gap-2 mt-10">
          {demos.map((demo, i) => (
            <button
              key={demo.id}
              onClick={() => setIndex(i)}
              aria-label={`Show ${demo.title}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-[#D4D4D4]' : 'w-1.5 bg-[#3A3A3A] hover:bg-[#555555]'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
