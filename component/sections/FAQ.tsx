'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'How do I care for my human hair extensions?',
    answer: 'Use sulphate-free shampoo and a nourishing conditioner. Air dry when possible, detangle with a wide-tooth comb from ends to roots, and avoid sleeping with wet extensions. Store flat or rolled when not in use.',
  },
  {
    question: 'Can I colour or heat-style the extensions?',
    answer: 'Yes — our 100% human hair extensions can be coloured, curled, straightened and heat-styled just like your own hair. Always apply a heat protectant spray and keep tools below 180 °C for longevity.',
  },
  {
    question: 'How long will my extensions last?',
    answer: 'With proper care, our premium extensions last 6–12 months or longer. Longevity depends on wear frequency, styling habits, and maintenance routine.',
  },
  {
    question: 'What is the price range?',
    answer: 'Our range starts from ₹4,999 for basic toppers and goes up to ₹24,999 for full wigs. Custom colour-matching orders may be priced differently — contact us for a quote.',
  },
  {
    question: 'Will they look natural on me?',
    answer: 'Absolutely. We use 100% Remy human hair with scalp-like bases and layered densities for an undetectable finish that blends seamlessly with your natural hair.',
  },
  {
    question: 'Which extensions suit thin hair best?',
    answer: 'Lightweight clip-in toppers or our seamless clip-in extension sets are ideal for fine or thinning hair — they add volume without pulling on your roots.',
  },
  {
    question: 'Will extensions damage my natural hair?',
    answer: 'No. Our silicone-padded clips distribute weight evenly and our lightweight bases prevent pulling. We recommend taking them off overnight to let your hair breathe.',
  },
  {
    question: 'Do you offer Cash on Delivery?',
    answer: 'Yes — COD is available across India. COD orders may carry a small additional charge visible at checkout and are processed after prepaid orders.',
  },
]

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-28 bg-[#121212]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label text-[#D4D4D4] mb-5 justify-center">
            Got Questions?
          </p>
          <h2 className="font-cormorant text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold text-white mb-5 leading-[1.08]">
            Frequently Asked
            <span className="block gradient-text">Questions</span>
          </h2>
          <p className="text-[#8A8A8A] text-base font-inter">
            Everything you need to know about our premium hair solutions.
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="luxury-card overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-white font-medium text-[0.9375rem] leading-snug font-inter">
                  {faq.question}
                </span>
                <span className="shrink-0 w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-[#D4D4D4] transition-colors hover:border-[#D4D4D4]">
                  {openIndex === index
                    ? <Minus className="w-4 h-4" />
                    : <Plus className="w-4 h-4" />
                  }
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-[#8A8A8A] leading-relaxed text-sm font-inter">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-[#8A8A8A] mb-6 font-inter text-sm">Still have questions? We&apos;re here to help.</p>
          <a
            href="https://wa.me/918104834173?text=Hi%20Glamorous%20Thread!%20I%20have%20a%20question."
            target="_blank"
            rel="noreferrer"
            className="luxury-button-outline"
          >
            Chat on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  )
}
