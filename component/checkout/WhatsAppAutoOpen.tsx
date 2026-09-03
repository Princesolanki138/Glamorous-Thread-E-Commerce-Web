'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, ExternalLink } from 'lucide-react'

export default function WhatsAppAutoOpen() {
  const [waUrl, setWaUrl] = useState<string | null>(null)
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    const storedUrl = sessionStorage.getItem('gemeria_wa_url')
    if (!storedUrl) return
    // Reading sessionStorage must happen post-mount to keep the server/client
    // first render identical (see the hydration-mismatch fix above) — this
    // setState is syncing from that external browser API, not derivable from
    // props/state, so it's outside the pattern this rule otherwise guards.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWaUrl(storedUrl)

    // Clear immediately so refreshing the page doesn't re-trigger
    sessionStorage.removeItem('gemeria_wa_url')
    sessionStorage.removeItem('gemeria_wa_order')

    // Attempt to open WhatsApp — works reliably on mobile (opens the app)
    // and on desktop browsers that allow window.open on page load
    const win = window.open(storedUrl, '_blank', 'noopener,noreferrer')
    if (win) {
      win.focus()
      // Deferred: reflects the outcome of the external window.open() call
      // rather than setting state synchronously in the effect body.
      queueMicrotask(() => setOpened(true))
    }
    // If blocked, `win` is null and the user sees the manual button below
  }, [])

  if (!waUrl) return null

  return (
    <div className="rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-5 mb-8">
      {opened ? (
        <div className="text-center">
          <p className="text-[#25D366] text-sm font-medium mb-1">WhatsApp opened!</p>
          <p className="text-[#8A8A8A] text-xs">Please send the pre-filled message to confirm your order.</p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-[#25D366] text-xs hover:underline"
          >
            <ExternalLink size={12} />
            Open again if it closed
          </a>
        </div>
      ) : (
        <div className="text-center">
          <MessageCircle className="w-8 h-8 text-[#25D366] mx-auto mb-3" />
          <p className="text-white text-sm font-medium mb-1">Tap to open WhatsApp</p>
          <p className="text-[#8A8A8A] text-xs mb-4 leading-relaxed">
            Your order message is ready. Tap the button below to open WhatsApp and send it.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-sm py-3 px-8 rounded-xl transition-colors w-full"
          >
            <MessageCircle size={16} />
            OPEN WHATSAPP
          </a>
        </div>
      )}
    </div>
  )
}
