import type { Metadata } from 'next'
import StaticPage from '@/component/common/StaticPage'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Hair care tips, wig maintenance advice and styling guides from the Glamorous Thread team.',
}

export default function Page() {
  return (
    <StaticPage
      title="Blog"
      label="Journal"
      intro="Care guides, styling advice and honest conversations about hair. New articles are published regularly."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <article className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]">
          <p className="section-label mb-4 text-[#D4D4D4]">Daily Care</p>
          <h2 className="mb-2 font-cormorant text-xl text-white">Hair Care Tips</h2>
          <p className="text-sm leading-relaxed text-[#8A8A8A]">Five habits that keep human hair extensions soft, shiny and shedding-free for far longer.</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#555555]">Coming soon</p>
        </article>
        <article className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]">
          <p className="section-label mb-4 text-[#D4D4D4]">Maintenance</p>
          <h2 className="mb-2 font-cormorant text-xl text-white">Wig Maintenance</h2>
          <p className="text-sm leading-relaxed text-[#8A8A8A]">How often to wash, which products to use, and the storage mistake that ruins most wigs.</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#555555]">Coming soon</p>
        </article>
        <article className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]">
          <p className="section-label mb-4 text-[#D4D4D4]">Styling</p>
          <h2 className="mb-2 font-cormorant text-xl text-white">Styling Guides</h2>
          <p className="text-sm leading-relaxed text-[#8A8A8A]">Heat settings, parting techniques and blending tips for a finish that looks like your own hair.</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#555555]">Coming soon</p>
        </article>
        <article className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]">
          <p className="section-label mb-4 text-[#D4D4D4]">Buying Guide</p>
          <h2 className="mb-2 font-cormorant text-xl text-white">Choosing Your First Topper</h2>
          <p className="text-sm leading-relaxed text-[#8A8A8A]">Base sizes, coverage and colour matching explained without the jargon.</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#555555]">Coming soon</p>
        </article>
        <article className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]">
          <p className="section-label mb-4 text-[#D4D4D4]">Confidence</p>
          <h2 className="mb-2 font-cormorant text-xl text-white">Living With Hair Loss</h2>
          <p className="text-sm leading-relaxed text-[#8A8A8A]">Practical, judgement-free advice from women who have been through it themselves.</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#555555]">Coming soon</p>
        </article>
        <article className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]">
          <p className="section-label mb-4 text-[#D4D4D4]">Colour</p>
          <h2 className="mb-2 font-cormorant text-xl text-white">Colour Matching 101</h2>
          <p className="text-sm leading-relaxed text-[#8A8A8A]">How to match your shade in natural light, and why phone photos so often mislead.</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#555555]">Coming soon</p>
        </article>
      </div>

    </StaticPage>
  )
}
