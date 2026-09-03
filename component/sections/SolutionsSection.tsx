'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Crown, Sparkles, Heart, Zap, Feather, ArrowRight } from 'lucide-react'

const solutions = [
  {
    title: 'Toppers & Scalp Coverage',
    description: 'Natural-looking coverage for everyday confidence.',
    icon: Crown,
    href: '/collection/hair-toppers',
  },
  {
    title: 'Wigs for Daily & Medical Wear',
    description: 'Secure, gentle solutions designed for comfort.',
    icon: Sparkles,
    href: '/collection/wigs',
  },
  {
    title: 'Hairline & Front Coverage',
    description: 'Designed to restore your natural hairline.',
    icon: Heart,
    href: '/collection/hair-patches',
  },
  {
    title: 'Extensions & Volume',
    description: 'Instant fullness, length and colour.',
    icon: Zap,
    href: '/collection/hair-extensions',
  },
  {
    title: 'Instant Styling Solutions',
    description: 'Easy-to-wear buns, braids and highlights.',
    icon: Feather,
    href: '/collection/accessories',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

export const SolutionsSection: React.FC = () => {
  return (
    <section className="py-28 bg-[#0E0E0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label text-[#D4D4D4] mb-5 justify-center">Our Range</p>
          <h2 className="font-cormorant text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold text-white mb-5 leading-[1.08]">
            Explore Our
            <span className="block gradient-text">Hair Solutions</span>
          </h2>
          <p className="text-[#8A8A8A] text-base max-w-xl mx-auto font-inter">
            Find the perfect solution for every hair need — crafted with premium human hair.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {solutions.map((solution) => {
            const Icon = solution.icon
            return (
              <motion.div key={solution.title} variants={itemVariants}>
                <Link
                  href={solution.href}
                  className="group block bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-7 h-full hover:border-[#D4D4D4]/40 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-all duration-400"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#222222] border border-brand-border flex items-center justify-center mb-6 group-hover:border-[#D4D4D4]/40 transition-colors">
                    <Icon className="w-5 h-5 text-[#D4D4D4]" />
                  </div>

                  <h3 className="text-white text-lg font-semibold mb-3 group-hover:text-[#D4D4D4] transition-colors font-inter leading-snug">
                    {solution.title}
                  </h3>
                  <p className="text-[#8A8A8A] text-sm leading-relaxed mb-6 font-inter">
                    {solution.description}
                  </p>

                  <div className="flex items-center gap-2 text-[#D4D4D4] text-xs font-semibold font-inter uppercase tracking-wider">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
