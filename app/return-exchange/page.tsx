import type { Metadata } from 'next'
import StaticPage, { Section } from '@/component/common/StaticPage'

export const metadata: Metadata = {
  title: 'Return &amp; Exchange',
  description: 'Return window, conditions and refund process for Glamorous Thread orders.',
}

export default function Page() {
  return (
    <StaticPage
      title="Return &amp; Exchange"
      label="Policies"
      intro="Hair is a personal purchase, and we want you to be happy with it. Here is exactly how returns and exchanges work."
    >
      <Section heading="Return Window">
        <p>You may request a return or exchange within <strong className="text-[#D4D4D4]">7 days</strong> of delivery. Requests made after this window cannot be accepted.</p>
      </Section>

      <Section heading="Conditions">
        <p>For hygiene reasons we can only accept returns where all of the following apply:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li>The product is unused, unwashed and uncut.</li>
          <li>Original packaging, tags and accessories are included.</li>
          <li>The hair has not been coloured, bleached or heat-styled.</li>
          <li>You can provide the order number and proof of purchase.</li>
        </ul>
      </Section>

      <Section heading="Items We Cannot Accept">
        <p>Worn or washed hair, custom-coloured or custom-cut pieces, and clearance items marked as final sale cannot be returned. This is a hygiene requirement rather than a commercial preference.</p>
      </Section>

      <Section heading="How To Return">
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li>Message us on WhatsApp with your order number and the reason for return.</li>
          <li>Our team confirms eligibility and shares the return address.</li>
          <li>Ship the item back in its original packaging. Return shipping is your responsibility unless the item was faulty or incorrect.</li>
          <li>We inspect the returned item on arrival, usually within 2 business days.</li>
        </ul>
      </Section>

      <Section heading="Refunds &amp; Exchanges">
        <p>Approved refunds are issued to your original payment method within 5&ndash;7 business days of inspection. Bank processing can add a further few days.</p>
        <p>For exchanges, we dispatch the replacement once the original has been received and approved. Any difference in price is settled before dispatch.</p>
        <p>If an item arrives faulty, damaged or incorrect, we cover return shipping and either replace it or refund it in full.</p>
      </Section>

    </StaticPage>
  )
}
