/**
 * Bootstraps an admin account by phone number.
 *
 *   npm run seed -- 9876543210
 *
 * Creates the user if they don't exist yet, then sets isAdmin = true.
 * Auth is mobile-OTP based, so the phone number is the login identifier.
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function normalizePhone(raw) {
  const digits = String(raw || '').replace(/[^\d]/g, '')
  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`
  return null
}

async function main() {
  const input = process.argv[2]
  if (!input) {
    console.error('Usage: npm run seed -- <phone-number>\nExample: npm run seed -- 9876543210')
    process.exit(1)
  }

  const phoneNumber = normalizePhone(input)
  if (!phoneNumber) {
    console.error(`"${input}" is not a valid 10-digit Indian mobile number.`)
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { phoneNumber } })

  if (existing?.isAdmin) {
    console.log('Already an admin:', phoneNumber)
    return
  }

  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { isAdmin: true } })
    : await prisma.user.create({ data: { phoneNumber, isAdmin: true } })

  try {
    await prisma.auditLog.create({
      data: {
        actorId: null,
        targetUserId: user.id,
        action: 'USER_ROLE_UPDATED',
        entityType: 'User',
        entityId: user.id,
        before: { isAdmin: existing?.isAdmin ?? false },
        after: { isAdmin: true },
        metadata: { source: 'seed-admin' },
      },
    })
  } catch (err) {
    console.error('Failed to write audit log (non-fatal):', err.message)
  }

  console.log(
    existing
      ? `Promoted existing user to admin: ${phoneNumber}`
      : `Created admin user: ${phoneNumber}`,
  )
  console.log('Sign in at /auth/login with this number.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
