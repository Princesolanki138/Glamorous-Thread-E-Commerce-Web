import React from 'react'
import Link from 'next/link'
import { Music } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa'

const footerLinks = {
  company: [
    { name: 'About Us',    href: '/about-us' },
    { name: 'Join Our Team', href: '/careers' },
    { name: 'Reviews',     href: '/reviews' },
    { name: 'Blog',        href: '/blog' },
  ],
  help: [
    { name: 'Contact Us',        href: '/contact-us' },
    { name: 'FAQs',              href: '/faqs' },
    { name: 'Shipping & Delivery', href: '/shipping-delivery' },
    { name: 'Size Guide',        href: '/size-guide' },
  ],
  policies: [
    { name: 'Terms of Service',   href: '/terms-of-service' },
    { name: 'Privacy Policy',     href: '/privacy-policy' },
    { name: 'Return & Exchange',  href: '/return-exchange' },
    { name: 'Warranty',           href: '/warranty' },
  ],
}

const socialLinks = [
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaTwitter,   href: '#', label: 'Twitter' },
  { icon: Music,       href: '#', label: 'Youtube' },
]

export const Footer: React.FC = () => {
  return (
    <div className="relative">
      {/* Wave divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
        <svg className="block w-full h-[140px]" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="#121212"
            d="M0,120 C240,80 480,80 720,120 C960,160 1200,160 1440,120 L1440,0 L0,0 Z"
          />
        </svg>
      </div>

      <footer className="pt-36 pb-10 bg-[#121212] text-white relative z-0">

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-[#1A1A1A]/40 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">

            {/* Brand column */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold tracking-[0.15em] uppercase mb-4 text-white">
                Glamorous Thread
              </h3>
              <p className="text-[#6B7280] mb-6 leading-relaxed">
                Premium hair solutions for women who refuse compromises.
                100% human hair with scalp-like finishes for a natural, undetectable look.
              </p>

              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-[#1A1A1A] border border-brand-border rounded-full flex items-center justify-center hover:bg-[#D4D4D4] hover:border-[#D4D4D4] hover:text-brand-bg transition-all"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([key, links]) => (
              <div key={key}>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] mb-5 text-[#D4D4D4] font-inter">
                  {key}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[#6B7280] hover:text-white text-sm transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div className="border-t border-brand-border pt-6 text-center text-[#5C5C5C] text-xs font-inter tracking-wide">
            © 2026 Glamorous Thread Hair Extension. All rights reserved.
          </div>

        </div>
      </footer>
    </div>
  )
}
