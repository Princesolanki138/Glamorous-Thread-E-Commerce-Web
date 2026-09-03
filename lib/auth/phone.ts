/**
 * Phone normalization shared by the auth API routes and the auth screens.
 * Kept free of server-only imports so client components can use it too.
 */

/**
 * Normalizes user-entered phone input to E.164.
 * Accepts "9876543210", "+919876543210", "919876543210", and spaced/dashed
 * variants. Returns null when the number isn't a valid Indian mobile.
 */
export function normalizePhoneServer(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, '')

  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`

  return null
}

/** Formats an E.164 number back into something readable for on-screen copy. */
export function displayPhone(e164: string): string {
  const match = e164.match(/^\+91(\d{10})$/)
  return match ? `+91 ${match[1].slice(0, 5)} ${match[1].slice(5)}` : e164
}
