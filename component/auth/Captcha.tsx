'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { inputClass, labelClass } from './authUi'

// Ambiguous glyphs (0/O, 1/I/L) are excluded so the code stays readable.
const CAPTCHA_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CAPTCHA_LENGTH = 5

function generateCode() {
  let out = ''
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    out += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]
  }
  return out
}

/**
 * Owns the generated captcha code.
 *
 * The code starts empty and is only generated after mount — generating it
 * during render would produce different values on the server and the client
 * and trip a hydration mismatch.
 */
export function useCaptcha() {
  const [code, setCode] = useState('')

  const refresh = useCallback(() => setCode(generateCode()), [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- must run post-mount: a render-time random value would not match the server-rendered HTML
    setCode(generateCode())
  }, [])

  /** Frontend-only check, per spec — there is no server-side captcha. */
  const verify = useCallback(
    (input: string) => code.length > 0 && input.trim().toUpperCase() === code,
    [code],
  )

  return { code, refresh, verify }
}

type CaptchaProps = {
  code: string
  value: string
  onChange: (value: string) => void
  onRefresh: () => void
  disabled?: boolean
}

export default function Captcha({ code, value, onChange, onRefresh, disabled }: CaptchaProps) {
  return (
    <div className="space-y-5">
      {/* Captcha display + refresh */}
      <div className="flex items-center gap-3">
        <div className="flex h-14 flex-1 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#111111] select-none">
          <span
            className="text-xl tracking-[0.4em] text-[#D4D4D4] italic"
            style={{
              fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
              textShadow: '0 1px 0 rgba(0,0,0,0.6)',
            }}
            aria-live="polite"
          >
            {code || '\u00A0'}
          </span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={disabled}
          aria-label="Refresh captcha"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#111111] text-[#8A8A8A] transition-colors hover:border-[#D4D4D4]/40 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Captcha input */}
      <div>
        <label className={labelClass}>
          Captcha <span className="text-red-400">*</span>
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter Captcha"
          maxLength={CAPTCHA_LENGTH}
          autoComplete="off"
          required
          disabled={disabled}
          className={`${inputClass} uppercase tracking-[0.2em]`}
        />
      </div>
    </div>
  )
}
