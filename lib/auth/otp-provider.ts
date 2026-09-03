import { prisma } from '@/lib/prisma'
import { sendOtpViaWhatsApp } from '@/lib/whatsapp'
import {
  generateOtp,
  hashOtp,
  otpExpiryMinutes,
  verifyOtpHash,
  MAX_OTP_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from './otp'
import * as minimoth from './providers/minimoth'

export interface ProviderResult {
  success: boolean
  error?: string
  code?: string
  /** Set when the code could not be delivered but was logged server-side (dev only). */
  devFallback?: boolean
}

/**
 * Which OTP backend is in use.
 *
 * MiniMoth handles delivery (WhatsApp first, SMS fallback), storage, expiry
 * and attempt limits on their side. When it isn't configured we fall back to
 * the self-hosted flow, which stores an HMAC of the code locally and delivers
 * it through the store's own WhatsApp Cloud API.
 */
export function activeProvider(): 'minimoth' | 'self-hosted' {
  return minimoth.isMiniMothConfigured() ? 'minimoth' : 'self-hosted'
}

// ─── Self-hosted implementation ──────────────────────────────────────────────

async function selfHostedSend(phone: string): Promise<ProviderResult> {
  const recent = await prisma.otp.findFirst({
    where: { phoneNumber: phone },
    orderBy: { createdAt: 'desc' },
  })
  if (recent) {
    const elapsed = (Date.now() - recent.createdAt.getTime()) / 1000
    if (elapsed < OTP_RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - elapsed)
      return { success: false, error: `Please wait ${wait}s before requesting another code.`, code: 'RATE_LIMITED' }
    }
  }

  const code = generateOtp()
  const expiresAt = new Date(Date.now() + otpExpiryMinutes() * 60 * 1000)

  await prisma.otp.deleteMany({ where: { phoneNumber: phone, verified: false } })
  await prisma.otp.create({ data: { phoneNumber: phone, code: hashOtp(code, phone), expiresAt } })
  await prisma.otp.deleteMany({ where: { expiresAt: { lt: new Date() } } })

  const result = await sendOtpViaWhatsApp(phone, code)
  if (result.success) return { success: true }

  // In development, log the code so the flow is testable before WhatsApp
  // templates are approved. Never in production.
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[dev] OTP for ${phone}: ${code} (WhatsApp send failed: ${result.error})`)
    return { success: true, devFallback: true }
  }

  console.error('OTP_SEND_ERROR', result.error)
  return { success: false, error: 'We could not send the code right now. Please try again.', code: 'SEND_FAILED' }
}

async function selfHostedVerify(phone: string, code: string): Promise<ProviderResult> {
  const otp = await prisma.otp.findFirst({
    where: { phoneNumber: phone, verified: false },
    orderBy: { createdAt: 'desc' },
  })
  if (!otp) return { success: false, error: 'Request a new code to continue.', code: 'OTP_NOT_FOUND' }

  if (otp.expiresAt < new Date()) {
    await prisma.otp.delete({ where: { id: otp.id } })
    return { success: false, error: 'That code has expired. Request a new one.', code: 'OTP_EXPIRED' }
  }

  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.otp.delete({ where: { id: otp.id } })
    return { success: false, error: 'Too many incorrect attempts. Request a new code.', code: 'VERIFY_RATE_LIMITED' }
  }

  if (!verifyOtpHash(code, phone, otp.code)) {
    await prisma.otp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } })
    return { success: false, error: 'That code is incorrect.', code: 'INVALID_OTP' }
  }

  // Burn the code so it cannot be replayed.
  await prisma.otp.update({ where: { id: otp.id }, data: { verified: true } })
  await prisma.otp.deleteMany({ where: { phoneNumber: phone, verified: false } })
  return { success: true }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<ProviderResult> {
  return activeProvider() === 'minimoth' ? minimoth.sendOtp(phone) : selfHostedSend(phone)
}

export async function verifyOtp(phone: string, code: string): Promise<ProviderResult> {
  return activeProvider() === 'minimoth' ? minimoth.verifyOtp(phone, code) : selfHostedVerify(phone, code)
}
