import type { Metadata } from 'next'
import StaticPage, { Section } from '@/component/common/StaticPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Glamorous Thread collects, uses and protects your personal data.',
}

export default function Page() {
  return (
    <StaticPage
      title="Privacy Policy"
      label="Policies"
      intro="What we collect, why we collect it, and what we do with it. In short: we collect what is needed to fulfil your order and nothing more."
    >
      <Section heading="Data We Collect">
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li><strong className="text-[#D4D4D4]">Account details</strong> &mdash; your mobile number, and your email address if you choose to provide one.</li>
          <li><strong className="text-[#D4D4D4]">Order details</strong> &mdash; delivery address, items ordered and order history.</li>
          <li><strong className="text-[#D4D4D4]">Communications</strong> &mdash; messages you send us through the contact form or WhatsApp.</li>
          <li><strong className="text-[#D4D4D4]">Technical data</strong> &mdash; basic device and browser information, plus the IP address recorded against administrative actions.</li>
        </ul>
      </Section>

      <Section heading="How We Use It">
        <p>We use your data to run the shop, specifically:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li>To process, dispatch and deliver your orders.</li>
          <li>To contact you about an order, including sending confirmations and payment details over WhatsApp.</li>
          <li>To provide customer support and respond to enquiries.</li>
          <li>To meet our legal and accounting obligations.</li>
        </ul>
      </Section>

      <Section heading="Cookies">
        <p>We use cookies that are necessary for the site to function, including a secure, HTTP-only session cookie that keeps you signed in. Your shopping cart is stored locally in your own browser.</p>
        <p>We do not use cookies to build advertising profiles.</p>
      </Section>

      <Section heading="Sharing">
        <p>We share data only where it is necessary to deliver your order or operate the site: with courier partners for delivery, with WhatsApp (Meta) to send you order and login messages, and with our hosting and database providers.</p>
        <p>We do not sell your personal data.</p>
      </Section>

      <Section heading="Your Rights &amp; Retention">
        <p>You may request a copy of your data, ask us to correct it, or ask us to delete your account. Write to <a href="mailto:support@glamorousthread.com" className="text-[#D4D4D4] underline underline-offset-4 transition-colors hover:text-white">support@glamorousthread.com</a> and we will respond.</p>
        <p>Order records are retained where we are required to keep them for tax and accounting purposes. One-time passcodes are short-lived and are deleted once used or expired.</p>
      </Section>

    </StaticPage>
  )
}
