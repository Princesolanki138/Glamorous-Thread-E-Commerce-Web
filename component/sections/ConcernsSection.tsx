'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const concerns = [
  {
    title: 'Scalp & Grey Coverage',
    subtitle: 'Natural Coverage Solutions',
    image: 'https://gemeriahair.in/cdn/shop/files/afsdaf_8a79644c-9743-49c7-9c55-acf2dfcfcea6.jpg',
    description: 'Premium toppers that blend seamlessly for grey coverage and scalp concealment.',
    slug: 'scalp-thinning-grey-coverage',
  },
  {
    title: 'Medical Hair Loss',
    subtitle: 'Gentle Medical Solutions',
    image: 'https://gemeriahair.in/cdn/shop/files/Medical_Hair_Loss.jpg',
    description: 'Hypoallergenic solutions designed for alopecia and chemotherapy-related loss.',
    slug: 'medical-hair-loss',
  },
  {
    title: 'Receding Hairline',
    subtitle: 'Restore Your Hairline',
    image: 'https://gemeriahair.in/cdn/shop/files/Receding_Hair_line.jpg',
    description: 'Front hairline toppers with undetectable gradual density transitions.',
    slug: 'add-length-volume',
  },
  {
    title: 'Short & Thin Hair',
    subtitle: 'Add Volume & Length',
    image: 'https://gemeriahair.in/cdn/shop/files/Short_and_Thing_Hair.jpg',
    description: 'Lightweight clip-in extensions that add instant volume without weighing down.',
    slug: 'add-volume',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export const ConcernsSection: React.FC = () => {
  return (
    <section className="py-28 bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label text-[#D4D4D4] mb-5 justify-center">
            Personalized Solutions
          </p>
          <h2 className="font-cormorant text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold text-white mb-5 leading-[1.08]">
            Find Your Perfect
            <span className="block gradient-text">Hair Solution</span>
          </h2>
          <p className="text-[#8A8A8A] text-base max-w-xl mx-auto font-inter">
            Every hair concern is unique. Discover your ideal match from our specialised solutions.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {concerns.map((concern) => (
            <motion.div key={concern.slug} variants={cardVariants}>
              <Link
                href={`/collection/${concern.slug}`}
                className="group block bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden h-full hover:border-[#D4D4D4]/40 transition-all duration-400"
              >
                {/* Image */}
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src={concern.image}
                    alt={concern.title}
                    fill
                    sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 22vw"
                    className="object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#121212]/75 via-transparent to-transparent" />

                  {/* Arrow */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-brand-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-[#D4D4D4] text-[0.6rem] uppercase tracking-[0.2em] mb-2 font-inter font-semibold">
                    {concern.subtitle}
                  </p>
                  <h3 className="text-white text-[0.9375rem] font-semibold mb-2 group-hover:text-[#D4D4D4] transition-colors font-inter leading-snug">
                    {concern.title}
                  </h3>
                  <p className="text-[#8A8A8A] text-sm leading-relaxed font-inter">
                    {concern.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[#D4D4D4] text-xs font-semibold font-inter group-hover:gap-2.5 transition-all uppercase tracking-wider">
                    <span>Explore</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p className="text-[#8A8A8A] mb-6 font-inter text-sm">Not sure which solution is right for you?</p>
          <Link href="/contact-us" className="luxury-button">
            Free Consultation
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
