/**
 * MiniMoth OTP provider.
 *
 * Contract verified against https://minimoth.dev/llms-full.txt and by probing
 * the live API. Note it differs from the shape commonly assumed:
 *   - routes live under /v1  (POST /v1/otp/send, POST /v1/otp/verify)
 *   - auth is an `X-Api-Key` header, NOT `Authorization: Bearer`
 *   - send takes { phone } only; there is no `channel` field. MiniMoth tries
 *     WhatsApp first and falls back to SMS server-side.
 *   - verify takes { phone, code } - not { phone, otp }
 *
 * MiniMoth also issues its own access/refresh tokens on verify. We ignore
 * them and mint our own session JWT, which their docs explicitly support.
 */

const DEFAULT_BASE_URL = 'https://api.minimoth.dev/v1'

function config() {
  const apiKey = process.env.MINIMOTH_API_KEY
  if (!apiKey) return null

  // Tolerate a base URL with or without the /v1 suffix.
  const raw = (process.env.MINIMOTH_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '')
  const baseUrl = /\/v\d+$/.test(raw) ? raw : `${raw}/v1`

  return { apiKey, baseUrl }
}

export function isMiniMothConfigured() {
  return config() !== null
}

interface MiniMothError {
  error?: string
  code?: string
  request_id?: string
}

export interface ProviderResult {
  success: boolean
  /** Message safe to show the end user. */
  error?: string
  /** Stable machine code from MiniMoth, for logging. */
  code?: string
}

/** Maps MiniMoth's stable error codes onto the wording used elsewhere in the app. */
function friendlyMessage(code: string | undefined, fallback: string): string {
  switch (code) {
    case 'INVALID_PHONE':
      return 'Enter a valid 10-digit mobile number.'
    case 'INVALID_OTP_CODE':
      return 'Enter the 6-digit code.'
    case 'OTP_NOT_FOUND':
      return 'That code has expired. Request a new one.'
    case 'INVALID_OTP':
      return 'That code is incorrect.'
    case 'VERIFY_RATE_LIMITED':
      return 'Too many incorrect attempts. Request a new code.'
    case 'OTP_RATE_LIMITED':
      return 'Too many requests. Please wait a few minutes and try again.'
    case 'SMS_FAILED':
      return 'We could not deliver the code right now. Please try again.'
    case 'MISSING_API_KEY':
    case 'INVALID_API_KEY':
      // Never surface a configuration fault as if the user mistyped something.
      return 'Login is temporarily unavailable. Please try again later.'
    default:
      return fallback
  }
}

async function call(path: string, body: Record<string, string>, fallbackError: string): Promise<ProviderResult> {
  const cfg = config()
  if (!cfg) return { success: false, error: 'MiniMoth is not configured.', code: 'NOT_CONFIGURED' }

  try {
    const res = await fetch(`${cfg.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'X-Api-Key': cfg.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (res.ok) return { success: true }

    const data = (await res.json().catch(() => null)) as MiniMothError | null
    if (data?.code === 'MISSING_API_KEY' || data?.code === 'INVALID_API_KEY') {
      console.error('MINIMOTH_AUTH_ERROR', data.code, data.request_id)
    }

    return {
      success: false,
      code: data?.code,
      error: friendlyMessage(data?.code, fallbackError),
    }
  } catch (error) {
    console.error('MINIMOTH_REQUEST_ERROR', error)
    return { success: false, error: fallbackError, code: 'NETWORK_ERROR' }
  }
}

/** Sends an OTP. MiniMoth picks WhatsApp, falling back to SMS. */
export function sendOtp(phone: string): Promise<ProviderResult> {
  return call('/otp/send', { phone }, 'We could not send a code to that number.')
}

/** Verifies a submitted code. */
export function verifyOtp(phone: string, code: string): Promise<ProviderResult> {
  return call('/otp/verify', { phone, code }, 'That code is incorrect or has expired.')
}
