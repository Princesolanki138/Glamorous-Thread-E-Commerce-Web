import { createHmac, timingSafeEqual, randomInt } from 'crypto'

export const OTP_LENGTH = 6

/** OTP lifetime in minutes; override with OTP_EXPIRY_MINUTES. */
export function otpExpiryMinutes(): number {
  const parsed = Number(process.env.OTP_EXPIRY_MINUTES)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5
}

/** Maximum verification attempts before an OTP is burned. */
export const MAX_OTP_ATTEMPTS = 5

/** Minimum seconds between OTP requests for the same number. */
export const OTP_RESEND_COOLDOWN_SECONDS = 30

/** Cryptographically random numeric OTP. */
export function generateOtp(): string {
  let code = ''
  for (let i = 0; i < OTP_LENGTH; i++) code += randomInt(0, 10).toString()
  return code
}

/**
 * HMACs the OTP with the server secret before storage. Keyed hashing (rather
 * than a plain hash) means a leaked database is not enough to brute-force a
 * 6-digit code offline — the attacker also needs the secret.
 */
export function hashOtp(code: string, phoneNumber: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is required to hash OTP codes.')

  return createHmac('sha256', secret).update(`${phoneNumber}:${code}`).digest('hex')
}

/** Constant-time comparison of a submitted OTP against the stored hash. */
export function verifyOtpHash(code: string, phoneNumber: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashOtp(code, phoneNumber), 'hex')
  const stored = Buffer.from(storedHash, 'hex')
  if (candidate.length !== stored.length) return false
  return timingSafeEqual(candidate, stored)
}
