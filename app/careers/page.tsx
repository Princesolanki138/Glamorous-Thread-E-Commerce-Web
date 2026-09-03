import type { Metadata } from 'next'
import StaticPage, { Section } from '@/component/common/StaticPage'

export const metadata: Metadata = {
  title: 'Join Our Team',
  description: 'Careers at Glamorous Thread. We are growing and looking for passionate people to join our team.',
}

export default function Page() {
  return (
    <StaticPage
      title="Join Our Team"
      label="Careers"
      intro="We are growing quickly, and we are looking for passionate people who care about craft, service, and helping women feel like themselves again."
    >
      <Section heading="Working With Us">
        <p>We are a small, hands-on team. That means real ownership, fast decisions, and direct contact with the customers we serve, whichever role you are in.</p>
        <p>If you care about doing things properly rather than merely quickly, you will fit in well here.</p>
      </Section>

      <Section heading="Open Positions">
        <p>We are currently hiring for the following roles:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li>Customer Experience Associate &mdash; Mumbai / Remote</li>
          <li>Hair Specialist &amp; Consultation Advisor &mdash; Mumbai</li>
          <li>Social Media &amp; Content Executive &mdash; Remote</li>
          <li>Warehouse &amp; Dispatch Coordinator &mdash; Mumbai</li>
        </ul>
      </Section>

      <Section heading="How To Apply">
        <p>Send your CV and a short note about why the role interests you to <a href="mailto:careers@glamorousthread.com" className="text-[#D4D4D4] underline underline-offset-4 transition-colors hover:text-white">careers@glamorousthread.com</a>.</p>
        <p>We read every application and reply to those we would like to speak with. If none of the roles above fit but you believe you could contribute, write to us anyway.</p>
      </Section>

    </StaticPage>
  )
}
