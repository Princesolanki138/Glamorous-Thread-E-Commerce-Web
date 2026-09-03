import type { Metadata } from 'next'
import Link from 'next/link'
import StaticPage, { Section } from '@/component/common/StaticPage'

export const metadata: Metadata = {
  title: 'Shipping &amp; Delivery',
  description: 'Delivery timelines, shipping charges and order tracking information for Glamorous Thread orders across India.',
}

export default function Page() {
  return (
    <StaticPage
      title="Shipping &amp; Delivery"
      label="Help"
      intro="How and when your order reaches you, what it costs, and how to track it."
    >
      <Section heading="Delivery Timelines (India)">
        <p>Orders are dispatched within 1&ndash;2 business days of payment being confirmed. Delivery estimates run from the dispatch date, not the order date.</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li><strong className="text-[#D4D4D4]">Metro cities</strong> (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) &mdash; 3&ndash;5 business days.</li>
          <li><strong className="text-[#D4D4D4]">Other cities and towns</strong> &mdash; 5&ndash;7 business days.</li>
          <li><strong className="text-[#D4D4D4]">Remote and north-eastern regions</strong> &mdash; 7&ndash;10 business days.</li>
        </ul>
      </Section>

      <Section heading="Shipping Charges">
        <p>Shipping is calculated automatically at checkout:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li><strong className="text-[#D4D4D4]">Orders of &#8377;599 and above</strong> &mdash; free shipping.</li>
          <li><strong className="text-[#D4D4D4]">Orders below &#8377;599</strong> &mdash; a flat &#8377;99 shipping fee.</li>
        </ul>
      </Section>

      <Section heading="Order Tracking">
        <p>Once your order is dispatched, our team sends the courier name and tracking number to your registered WhatsApp number.</p>
        <p>You can also see the current status of every order under <Link href="/orders" className="text-[#D4D4D4] underline underline-offset-4 transition-colors hover:text-white">My Orders</Link> when signed in. If tracking has not updated for more than 48 hours, message us and we will chase the courier on your behalf.</p>
      </Section>

      <Section heading="Delays">
        <p>Public holidays, regional festivals and severe weather can occasionally extend delivery times beyond the estimates above. Where we know about a delay, we will tell you proactively rather than leaving you to discover it.</p>
      </Section>

    </StaticPage>
  )
}
