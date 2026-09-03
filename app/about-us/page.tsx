import type { Metadata } from 'next'
import StaticPage, { Section } from '@/component/common/StaticPage'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Glamorous Thread - premium 100% human hair wigs, extensions and toppers, crafted to restore confidence.',
}

export default function Page() {
  return (
    <StaticPage
      title="About Us"
      label="Our Brand"
      intro="Glamorous Thread creates premium 100% human hair wigs, extensions and toppers for women across India."
    >
      <Section heading="Our Story">
        <p>Glamorous Thread began with a simple observation: too many women were offered hair that looked artificial, felt uncomfortable, and could not be worn every day with confidence.</p>
        <p>We set out to change that by sourcing genuine 100% human hair and finishing every piece to a standard we would happily wear ourselves. What began as a small, quality-obsessed operation now serves more than 200,000 women nationwide.</p>
      </Section>

      <Section heading="Our Mission">
        <p>Our mission is confidence and beauty, in that order. Hair loss, thinning and post-treatment regrowth are deeply personal experiences, and the right hair should feel like your own rather than something you are hiding behind.</p>
        <p>Every product we ship is judged against a single question: does this make the person wearing it feel more like themselves?</p>
      </Section>

      <Section heading="Why Choose Us">
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li><strong className="text-[#D4D4D4]">100% human hair</strong> - never synthetic blends, so it can be washed, styled and heat-treated like your own.</li>
          <li><strong className="text-[#D4D4D4]">Clinically comfortable</strong> - breathable bases designed for all-day, everyday wear.</li>
          <li><strong className="text-[#D4D4D4]">Natural blending</strong> - colours and textures matched to Indian hair.</li>
          <li><strong className="text-[#D4D4D4]">Personal guidance</strong> - speak to a real person on WhatsApp before and after you buy.</li>
          <li><strong className="text-[#D4D4D4]">Trusted at scale</strong> - loved by over 200,000 women across India.</li>
        </ul>
      </Section>

    </StaticPage>
  )
}
