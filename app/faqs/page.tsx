import type { Metadata } from 'next'
import StaticPage from '@/component/common/StaticPage'

export const metadata: Metadata = {
  title: 'FAQs',
  description: 'Answers to common questions about shipping, payment, returns and hair quality at Glamorous Thread.',
}

export default function Page() {
  return (
    <StaticPage
      title="Frequently Asked Questions"
      label="Help"
      intro="The questions customers ask us most. If yours is not answered here, our team is a WhatsApp message away."
    >
      <div className="space-y-4">
        <details className="group rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-white">
            How long does shipping take?
            <span className="shrink-0 text-lg text-[#8A8A8A] transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-[#8A8A8A]">Orders within India are typically delivered in 3&ndash;7 business days, and metro cities usually arrive sooner. You will receive tracking details over WhatsApp once your order is dispatched.</p>
        </details>
        <details className="group rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-white">
            What payment methods do you accept?
            <span className="shrink-0 text-lg text-[#8A8A8A] transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-[#8A8A8A]">Payment is arranged directly with our team over WhatsApp once your order is confirmed. We accept UPI and bank transfer. Our team sends you the payment details and confirms receipt before dispatch.</p>
        </details>
        <details className="group rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-white">
            What is your return policy?
            <span className="shrink-0 text-lg text-[#8A8A8A] transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-[#8A8A8A]">Unused products in their original condition and packaging can be returned within 7 days of delivery. For hygiene reasons, hair that has been worn, washed, cut or coloured cannot be returned. See our Return &amp; Exchange page for full terms.</p>
        </details>
        <details className="group rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-white">
            Is the hair really 100% human hair?
            <span className="shrink-0 text-lg text-[#8A8A8A] transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-[#8A8A8A]">Yes. Every wig, extension and topper we sell is made from 100% human hair, never synthetic or blended. That is precisely why it can be washed, heat-styled and coloured like your own hair.</p>
        </details>
        <details className="group rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-white">
            How do I choose the right shade?
            <span className="shrink-0 text-lg text-[#8A8A8A] transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-[#8A8A8A]">Compare your hair against our shade options in natural daylight rather than indoor lighting, which distorts colour badly. If you are unsure, message us on WhatsApp with a photo and we will help you match it.</p>
        </details>
        <details className="group rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-colors hover:border-[#333333]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-white">
            How long will my hair last?
            <span className="shrink-0 text-lg text-[#8A8A8A] transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-[#8A8A8A]">With proper care, our human hair pieces typically last 8&ndash;12 months of regular wear, and considerably longer with occasional use. Following our care guides makes a real difference to longevity.</p>
        </details>
      </div>

    </StaticPage>
  )
}
