import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leadSchema, ok, err, validationErr } from '@/lib/validations'

/**
 * Public lead capture (contact form).
 *
 * Deliberately unauthenticated - this is how visitors reach the business.
 * Leads land in the existing Lead CRM under /admin/leads.
 */
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  const { name, email, phone, subject, message, source, productId } = parsed.data

  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        message,
        email: email?.trim() ? email.trim() : null,
        subject: subject?.trim() || null,
        source: source ?? 'CONTACT_FORM',
        productId: productId ?? null,
      },
    })

    return ok({ id: lead.id }, 201)
  } catch (error) {
    console.error('LEAD_CREATE_ERROR', error)
    return err('Unable to send your message right now. Please try again.', 500)
  }
}
