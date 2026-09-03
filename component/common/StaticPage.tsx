import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Header from '@/component/layout/Header'
import { Footer } from '@/component/layout/Footer'

/**
 * Shared shell for the static informational pages.
 *
 * Mirrors the composition already used by the storefront pages
 * (see app/collection/page.tsx): Header, a centred hero heading, then the
 * page body, then Footer - using the same tokens (font-cormorant headings,
 * section-label eyebrow, #8A8A8A body copy) so these read as part of the
 * same site rather than a separate template.
 */
export default function StaticPage({
  title,
  label,
  intro,
  children,
}: {
  title: string
  label?: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <Header />

      <main className="pt-40 md:pt-48 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-[#555555]">
            <Link href="/" className="transition-colors hover:text-[#D4D4D4]">
              Home
            </Link>
            <ChevronRight size={12} strokeWidth={1.5} />
            <span className="text-[#8A8A8A]">{title}</span>
          </nav>

          {/* Heading */}
          <div className="text-center mb-14">
            {label && <p className="section-label text-[#D4D4D4] mb-5 justify-center">{label}</p>}
            <h1 className="font-cormorant text-[clamp(2.25rem,5vw,3.5rem)] font-bold text-white leading-[1.05]">
              {title}
            </h1>
            {intro && (
              <p className="text-[#8A8A8A] text-sm md:text-base mt-5 max-w-2xl mx-auto leading-relaxed">
                {intro}
              </p>
            )}
          </div>

          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}

/** A titled content block, used to build up the body of a static page. */
export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="font-cormorant text-2xl md:text-3xl text-white mb-4">{heading}</h2>
      <div className="space-y-4 text-[#8A8A8A] text-sm md:text-[0.95rem] leading-relaxed">
        {children}
      </div>
    </section>
  )
}
