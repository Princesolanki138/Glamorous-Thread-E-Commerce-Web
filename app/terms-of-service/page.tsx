import type { Metadata } from 'next'
import StaticPage, { Section } from '@/component/common/StaticPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing use of the Glamorous Thread website, orders and payments.',
}

export default function Page() {
  return (
    <StaticPage
      title="Terms of Service"
      label="Policies"
      intro="These terms govern your use of this website and any order you place with us. By using the site, you accept them."
    >
      <Section heading="Use of This Website">
        <p>You may browse, shop and create an account for personal, non-commercial use. You agree not to misuse the site, attempt to gain unauthorised access to it, or copy its content for resale.</p>
        <p>All content on this site, including images, product descriptions and branding, remains our property.</p>
      </Section>

      <Section heading="Orders &amp; Payments">
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li>Placing an order is an offer to buy. A contract is formed only once we confirm the order and payment.</li>
          <li>Order totals are calculated on our servers from current catalogue prices; the price confirmed by our team is the price that applies.</li>
          <li>Payment is arranged over WhatsApp and confirmed manually by our team before dispatch.</li>
          <li>We may decline or cancel an order where stock is unavailable, where a pricing error has occurred, or where we suspect fraud.</li>
        </ul>
      </Section>

      <Section heading="Product Representation">
        <p>We photograph our products carefully, but screen calibration varies between devices. Slight variation between the shade you see on screen and the product you receive is normal and is not a defect.</p>
        <p>Being natural human hair, small variations in texture and tone between pieces are inherent to the material.</p>
      </Section>

      <Section heading="Liability">
        <p>Our liability in connection with any order is limited to the value of that order. We are not liable for indirect or consequential loss.</p>
        <p>Nothing in these terms limits liability that cannot lawfully be limited, including your statutory rights as a consumer under Indian law.</p>
      </Section>

      <Section heading="Changes">
        <p>We may update these terms from time to time. The version published on this page at the time you place an order is the version that governs it.</p>
      </Section>

    </StaticPage>
  )
}
