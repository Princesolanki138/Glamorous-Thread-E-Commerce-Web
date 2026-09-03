import dynamic from 'next/dynamic'
import Header from '@/component/layout/Header'
import { Hero } from '@/component/sections/Hero'
import SmoothScroll from '@/component/animations/SmoothScroll'
import { getBestSellers, getTestimonials } from '@/lib/products'

// Lazy-load every below-fold section — defers their JS until needed
const ConcernsSection = dynamic(() => import('@/component/sections/ConcernsSection').then(m => ({ default: m.ConcernsSection })))
const BeforeAfter      = dynamic(() => import('@/component/sections/BeforeAfter'))
const BestSellers      = dynamic(() => import('@/component/sections/BestSellers').then(m => ({ default: m.BestSellers })))
const TrustSection     = dynamic(() => import('@/component/sections/TrustSection').then(m => ({ default: m.TrustSection })))
const Testimonials     = dynamic(() => import('@/component/sections/Testimonials').then(m => ({ default: m.Testimonials })))
const GlamExperts      = dynamic(() => import('@/component/sections/GlamExperts').then(m => ({ default: m.GlamExperts })))
const SolutionsSection = dynamic(() => import('@/component/sections/SolutionsSection').then(m => ({ default: m.SolutionsSection })))
const FAQ              = dynamic(() => import('@/component/sections/FAQ').then(m => ({ default: m.FAQ })))
const Footer           = dynamic(() => import('@/component/layout/Footer').then(m => ({ default: m.Footer })))

export default async function Home() {
  const [bestSellers, testimonials] = await Promise.all([
    getBestSellers(8),
    getTestimonials(3),
  ])

  return (
    <main className="bg-brand-bg">
      <SmoothScroll />
      <Header />

      <Hero />
      <ConcernsSection />
      <BeforeAfter />
      <BestSellers products={bestSellers} />
      <TrustSection />
      <Testimonials testimonials={testimonials} />
      <GlamExperts />
      <SolutionsSection />
      <FAQ />

      <Footer />
    </main>
  )
}
