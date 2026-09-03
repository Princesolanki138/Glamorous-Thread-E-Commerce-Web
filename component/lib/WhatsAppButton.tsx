'use client'

import React from 'react'
import { FaWhatsapp } from 'react-icons/fa'

const DEFAULT_WHATSAPP_NUMBER = '918104834173'

function encodeWhatsAppText(text: string) {
  return encodeURIComponent(text)
}

export type WhatsAppButtonProps = {
  /** WhatsApp number without +, spaces, or leading zeros. Example: 919876543210 */
  phoneNumber?: string
  /** Optional prefilled message */
  message?: string
  /** Button label (shown to screen readers) */
  ariaLabel?: string
  /** Toggle visibility (useful if you want to hide on certain pages) */
  className?: string
}

export default function WhatsAppButton({
  phoneNumber,
  message,
  ariaLabel,
  className,
}: WhatsAppButtonProps) {
  const number = phoneNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER

  const text = message ?? 'Hi Glamorous Thread, I need help.'
  const href = `https://wa.me/${number}?text=${encodeWhatsAppText(text)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel ?? 'Chat on WhatsApp'}
      className={
        className ??
        "fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] flex items-center justify-center hover:bg-[#1fb859] transition-all duration-300 animate-[waPulse_2.2s_ease-in-out_infinite]"
      }
    >
      <style jsx>{`
        @keyframes waPulse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.05); }
        }
      `}</style>
      <FaWhatsapp size={26} />
    </a>
  )
}

