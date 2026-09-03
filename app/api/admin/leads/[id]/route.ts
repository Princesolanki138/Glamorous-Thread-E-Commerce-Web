import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { leadUpdateSchema, ok, err, validationErr } from '@/lib/validations'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params

  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) return err('Lead not found', 404)

  return ok(lead)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = leadUpdateSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)

  const existing = await prisma.lead.findUnique({ where: { id } })
  if (!existing) return err('Lead not found', 404)

  const updated = await prisma.lead.update({
    where: { id },
    data: parsed.data,
  })

  return ok(updated)
}
