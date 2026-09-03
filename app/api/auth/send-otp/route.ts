import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ok, err, validationErr } from '@/lib/validations'
import { normalizePhoneServer } from '@/lib/auth/phone'
import { activeProvider, sendOtp } from '@/lib/auth/otp-provider'

const sendOtpSchema = z.object({
  phoneNumber: z.string().min(10).max(20),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = sendOtpSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  const phoneNumber = normalizePhoneServer(parsed.data.phoneNumber)
  if (!phoneNumber) return err('Enter a valid 10-digit mobile number.', 400)

  const provider = activeProvider()
  const result = await sendOtp(phoneNumber)

  // Log the attempt; never let logging failures break the flow.
  await prisma.otpLog
    .create({
      data: {
        phoneNumber,
        status: result.success ? 'SENT' : 'FAILED',
        provider,
        detail: result.code,
      },
    })
    .catch(() => null)

  if (!result.success) {
    const status = result.code === 'RATE_LIMITED' || result.code === 'OTP_RATE_LIMITED' ? 429 : 502
    return err(result.error || 'We could not send the code right now.', status)
  }

  return ok({ sent: !result.devFallback, devFallback: result.devFallback ?? false })
}
