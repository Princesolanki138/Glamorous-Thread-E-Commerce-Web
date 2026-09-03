import type { Metadata } from 'next'
import StaticPage, { Section } from '@/component/common/StaticPage'

export const metadata: Metadata = {
  title: 'Customer Reviews',
  description: 'Read what customers across India say about Glamorous Thread wigs, extensions and toppers.',
}

export default function Page() {
  return (
    <StaticPage
      title="Customer Reviews"
      label="Real Experiences"
      intro="A selection of feedback from customers across India. Reviews shown on individual product pages are written by verified buyers."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Ananya S.</p>
              <p className="mt-0.5 text-xs text-[#555555]">Mumbai</p>
            </div>
            <div className="flex shrink-0 gap-0.5 text-sm" aria-label="5 out of 5 stars"><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span></div>
          </div>
          <p className="text-sm leading-relaxed text-[#8A8A8A]">&ldquo;I was nervous about ordering hair online, but the blending is genuinely seamless. Nobody has been able to tell. Worth every rupee.&rdquo;</p>
        </div>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Priya M.</p>
              <p className="mt-0.5 text-xs text-[#555555]">Bengaluru</p>
            </div>
            <div className="flex shrink-0 gap-0.5 text-sm" aria-label="5 out of 5 stars"><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span></div>
          </div>
          <p className="text-sm leading-relaxed text-[#8A8A8A]">&ldquo;After chemotherapy I struggled to find something comfortable. This is light, breathable, and I forget I am wearing it.&rdquo;</p>
        </div>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Ritika D.</p>
              <p className="mt-0.5 text-xs text-[#555555]">Delhi</p>
            </div>
            <div className="flex shrink-0 gap-0.5 text-sm" aria-label="4 out of 5 stars"><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#333333]">&#9733;</span></div>
          </div>
          <p className="text-sm leading-relaxed text-[#8A8A8A]">&ldquo;Beautiful quality and the colour matched perfectly. Delivery took a couple of days longer than expected, but the team kept me updated on WhatsApp throughout.&rdquo;</p>
        </div>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Sneha K.</p>
              <p className="mt-0.5 text-xs text-[#555555]">Pune</p>
            </div>
            <div className="flex shrink-0 gap-0.5 text-sm" aria-label="5 out of 5 stars"><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span></div>
          </div>
          <p className="text-sm leading-relaxed text-[#8A8A8A]">&ldquo;The volume it adds is unreal and it still looks completely natural. I have washed and styled it several times with no shedding.&rdquo;</p>
        </div>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Meera J.</p>
              <p className="mt-0.5 text-xs text-[#555555]">Hyderabad</p>
            </div>
            <div className="flex shrink-0 gap-0.5 text-sm" aria-label="5 out of 5 stars"><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span><span className="text-[#D4D4D4]">&#9733;</span></div>
          </div>
          <p className="text-sm leading-relaxed text-[#8A8A8A]">&ldquo;What sold me was the consultation. They talked me out of a more expensive piece because a simpler one suited my hair better. Rare, and appreciated.&rdquo;</p>
        </div>
      </div>

      <Section heading="Share Your Experience">
        <p>Bought from us recently? You can leave a review directly on the product page once you are signed in. It genuinely helps other women shop with confidence.</p>
      </Section>

    </StaticPage>
  )
}
