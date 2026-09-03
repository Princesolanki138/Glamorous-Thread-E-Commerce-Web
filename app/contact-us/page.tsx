import type { Metadata } from 'next'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import StaticPage, { Section } from '@/component/common/StaticPage'
import ContactForm from '@/component/common/ContactForm'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '918104834173'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Glamorous Thread team by WhatsApp, phone or email, or send us a message directly.',
}

export default function Page() {
  return (
    <StaticPage
      title="Contact Us"
      label="Help"
      intro="Questions about a product, an order, or which piece would suit you best? Our team is happy to help."
    >
      {/* Direct contact */}
      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Glamorous Thread, I need help.')}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-2 rounded-2xl border border-[#25D366]/20 bg-[#25D366]/5 p-6 text-center transition-colors hover:border-[#25D366]/40"
        >
          <MessageCircle size={20} strokeWidth={1.5} className="text-[#25D366]" />
          <span className="text-sm font-medium text-white">WhatsApp</span>
          <span className="text-xs text-[#8A8A8A]">Fastest reply</span>
        </a>

        <a
          href="tel:+918104834173"
          className="flex flex-col items-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 text-center transition-colors hover:border-[#333333]"
        >
          <Phone size={20} strokeWidth={1.5} className="text-[#D4D4D4]" />
          <span className="text-sm font-medium text-white">+91 81048 34173</span>
          <span className="text-xs text-[#8A8A8A]">Mon&ndash;Sat, 10am&ndash;7pm</span>
        </a>

        <a
          href="mailto:support@glamorousthread.com"
          className="flex flex-col items-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 text-center transition-colors hover:border-[#333333]"
        >
          <Mail size={20} strokeWidth={1.5} className="text-[#D4D4D4]" />
          <span className="text-sm font-medium text-white">Email</span>
          <span className="text-xs text-[#8A8A8A]">support@glamorousthread.com</span>
        </a>
      </div>

      <Section heading="Send Us A Message">
        <p>
          Fill in the form below and our team will get back to you, usually within one business day.
        </p>
      </Section>

      <div className="-mt-6">
        <ContactForm />
      </div>
    </StaticPage>
  )
}
