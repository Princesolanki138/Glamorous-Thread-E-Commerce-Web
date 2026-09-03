/**
 * Shared primitives for the auth screens.
 *
 * The class strings below are copied verbatim from the existing storefront
 * form styling (component/checkout/CheckoutAddress.tsx) so the auth screens
 * use the same design language as the rest of the site rather than a new one.
 */

export { normalizePhoneServer as normalizePhone, displayPhone } from '@/lib/auth/phone'

export const inputClass =
  'w-full h-14 px-5 rounded-xl border border-[#2A2A2A] bg-[#111111] text-white placeholder-[#444444] outline-none focus:border-[#D4D4D4]/40 transition-colors text-sm'

export const labelClass = 'block text-[10px] uppercase tracking-[0.18em] text-[#555555] mb-2'

/** OTPs are delivered over WhatsApp, reusing the store's Business Cloud API. */
export const PHONE_CODE_CHANNEL_LABEL = 'WhatsApp'

/** Pulls the error message out of the shared `{ success: false, error }` envelope. */
export function apiErrorMessage(data: unknown, fallback: string): string {
  const error = (data as { error?: string } | null)?.error
  return typeof error === 'string' && error ? error : fallback
}
