import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
import { ok, err, validationErr } from '@/lib/validations'

const SELECT = {
  id: true,
  name: true,
  phoneNumber: true,
  email: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  isAdmin: true,
} as const

/** Empty strings from the form mean "clear this field", so map them to null. */
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(''))

const updateSchema = z.object({
  name:    optionalText(80),
  email:   z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  address: optionalText(200),
  city:    optionalText(80),
  state:   optionalText(80),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode').optional().or(z.literal('')),
})

/** Returns the signed-in user's profile. */
export async function GET() {
  const session = await getSession()
  if (!session) return err('You must be signed in.', 401)

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: SELECT })
  if (!user) return err('User not found', 404)

  return ok({ user })
}

/** Updates the signed-in user's profile. The phone number is the login identifier and is not editable here. */
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return err('You must be signed in.', 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  const d = parsed.data
  const blank = (v: string | undefined) => (v && v.length > 0 ? v : null)

  try {
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name:    blank(d.name),
        email:   blank(d.email),
        address: blank(d.address),
        city:    blank(d.city),
        state:   blank(d.state),
        pincode: blank(d.pincode),
      },
      select: SELECT,
    })

    return ok({ user })
  } catch (error) {
    // email is unique across users
    if ((error as { code?: string })?.code === 'P2002') {
      return err('That email address is already in use.', 409)
    }
    console.error('USER_UPDATE_ERROR', error)
    return err('Unable to save your profile right now. Please try again.', 500)
  }
}
