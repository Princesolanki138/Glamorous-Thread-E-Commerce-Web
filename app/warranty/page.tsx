import type { Metadata } from 'next'
import StaticPage, { Section } from '@/component/common/StaticPage'

export const metadata: Metadata = {
  title: 'Warranty',
  description: 'Warranty terms, coverage and claim process for Glamorous Thread products.',
}

export default function Page() {
  return (
    <StaticPage
      title="Warranty"
      label="Policies"
      intro="Every product is inspected before dispatch. If a genuine manufacturing fault appears, we will put it right."
    >
      <Section heading="What Is Covered">
        <p>We provide a <strong className="text-[#D4D4D4]">90-day warranty</strong> from the date of delivery against manufacturing defects.</p>
      </Section>

      <Section heading="Covered Defects">
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li>Base, cap or lace separating or tearing under normal wear.</li>
          <li>Clips, combs or fastenings failing under normal use.</li>
          <li>Abnormal shedding well beyond what is expected of human hair.</li>
          <li>Significant construction faults present on arrival.</li>
        </ul>
      </Section>

      <Section heading="Not Covered">
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li>Normal wear and tear, including gradual thinning over months of daily use.</li>
          <li>Damage from heat styling above recommended temperatures.</li>
          <li>Colour change caused by bleaching, dyeing, chlorine or sun exposure.</li>
          <li>Damage from improper washing, brushing or storage.</li>
          <li>Alterations, cutting or restyling carried out by a third party.</li>
        </ul>
      </Section>

      <Section heading="Making A Claim">
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li>Message us on WhatsApp with your order number and clear photographs of the issue.</li>
          <li>Our team reviews the claim, usually within 2 business days.</li>
          <li>Where needed, we may ask you to return the item for closer inspection.</li>
          <li>Approved claims are resolved by repair, replacement or refund, at our discretion and in consultation with you.</li>
        </ul>
      </Section>

      <Section heading="Caring For Your Hair">
        <p>Most problems we see are preventable. Washing with sulphate-free products, using heat protection, brushing from the ends upwards, and storing the piece on a stand rather than folded will considerably extend its life.</p>
      </Section>

    </StaticPage>
  )
}
