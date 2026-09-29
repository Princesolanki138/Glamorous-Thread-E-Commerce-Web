import 'server-only'

/**
 * MiniMoth OTP provider (SECURE VERSION)
 *
 * Fixes:
 * - Prevents env leakage into build output
 * - Ensures runtime-only access to secrets
 * - Guards against accidental client usage
 */

function assertServer() {
  if (typeof window !== 'undefined') {
    throw new Error('MiniMoth provider can only be used on the server.')
  }
}

function getConfig() {
  assertServer()

  const apiKey = process.env['MINIMOTH_API_KEY']
  if (!apiKey) return null

  const rawUrl = process.env['MINIMOTH_BASE_URL']
  if (!rawUrl) {
    console.error('MINIMOTH_BASE_URL is required when MINIMOTH_API_KEY is set.')
    return null
  }

  // Normalize URL (avoid build-time evaluation issues)
  const raw = rawUrl.replace(/\/+$/, '')
  const baseUrl = /\/v\d+$/.test(raw) ? raw : `${raw}/v1`

  return { apiKey, baseUrl }
}

export function isMiniMothConfigured() {
  return getConfig() !== null
}

interface MiniMothError {
  error?: string
  code?: string
  request_id?: string
}

export interface ProviderResult {
  success: boolean
  error?: string
  code?: string
}

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
      return 'Login is temporarily unavailable. Please try again later.'
    default:
      return fallback
  }
}

async function call(
  path: string,
  body: Record<string, string>,
  fallbackError: string
): Promise<ProviderResult> {
  const cfg = getConfig()
  if (!cfg) {
    return {
      success: false,
      error: 'MiniMoth is not configured.',
      code: 'NOT_CONFIGURED',
    }
  }

  try {
    const res = await fetch(`${cfg.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'X-Api-Key': cfg.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store', // prevent caching sensitive responses
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
    return {
      success: false,
      error: fallbackError,
      code: 'NETWORK_ERROR',
    }
  }
}

/** Sends an OTP */
export async function sendOtp(phone: string): Promise<ProviderResult> {
  assertServer()
  return call('/otp/send', { phone }, 'We could not send a code to that number.')
}

/** Verifies OTP */
export async function verifyOtp(phone: string, code: string): Promise<ProviderResult> {
  assertServer()
  return call('/otp/verify', { phone, code }, 'That code is incorrect or has expired.')
}