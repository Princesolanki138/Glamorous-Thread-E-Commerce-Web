import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ok, err, validationErr } from '@/lib/validations'
import { createSession } from '@/lib/auth/session'
import { OTP_LENGTH } from '@/lib/auth/otp'
import { normalizePhoneServer } from '@/lib/auth/phone'
import { activeProvider, verifyOtp } from '@/lib/auth/otp-provider'
import { createAuditLog } from '@/lib/audit'

const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(10).max(20),
  code: z.string().length(OTP_LENGTH).regex(/^[0-9]+$/, `Enter the ${OTP_LENGTH}-digit code.`),
  email: z.string().email().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = verifyOtpSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  const phoneNumber = normalizePhoneServer(parsed.data.phoneNumber)
  if (!phoneNumber) return err('Enter a valid 10-digit mobile number.', 400)

  const provider = activeProvider()
  const result = await verifyOtp(phoneNumber, parsed.data.code)

  await prisma.otpLog
    .create({
      data: {
        phoneNumber,
        status: result.success ? 'VERIFIED' : 'FAILED',
        provider,
        detail: result.code,
      },
    })
    .catch(() => null)

  if (!result.success) {
    const status = result.code === 'VERIFY_RATE_LIMITED' ? 429 : 400
    return err(result.error || 'That code is incorrect.', status)
  }

  const email = parsed.data.email?.trim() || undefined
  const existing = await prisma.user.findUnique({ where: { phoneNumber } })

  const user = existing
    ? // Only fill in an email if the account doesn't already have one.
      existing.email || !email
      ? existing
      : await prisma.user.update({ where: { id: existing.id }, data: { email } })
    : await prisma.user.create({ data: { phoneNumber, email } })

  await createSession({
    userId: user.id,
    phoneNumber: user.phoneNumber,
    isAdmin: user.isAdmin,
  })

  if (!existing) {
    await createAuditLog({
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      actorId: user.id,
      after: { phoneNumber: user.phoneNumber },
    })
  }

  return ok({
    user: { id: user.id, phoneNumber: user.phoneNumber, isAdmin: user.isAdmin },
    isNewUser: !existing,
    // Admins land straight in the panel; everyone else goes to their account.
    redirectTo: user.isAdmin ? '/admin/dashboard' : '/account',
  })
}
