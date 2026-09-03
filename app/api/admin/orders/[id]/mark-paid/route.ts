import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { ok, err, validationErr } from '@/lib/validations'
import { sendWhatsAppTemplate, paymentSuccessTemplateParams, toWhatsAppPhone } from '@/lib/whatsapp'

const PAYMENT_SUCCESS_TEMPLATE = process.env.WHATSAPP_PAYMENT_SUCCESS_TEMPLATE_NAME

const markPaidSchema = z.object({
  note: z.string().max(500).optional(),
})

/**
 * There is no payment gateway — payment is coordinated over WhatsApp and
 * confirmed manually by an admin after verifying receipt (UPI screenshot,
 * bank transfer, etc.) outside the app. This is the only way `paymentStatus`
 * ever becomes PAID.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params

  let body: unknown = {}
  try {
    const text = await req.text()
    body = text ? JSON.parse(text) : {}
  } catch {
    return err('Invalid request body', 400)
  }

  const parsed = markPaidSchema.safeParse(body)
  if (!parsed.success) return validationErr(parsed.error)
  const { note } = parsed.data

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) return err('Order not found', 404)

  if (order.status === 'CANCELLED') return err('Cannot mark a cancelled order as paid.', 400)
  if (order.paymentStatus === 'PAID') return err('Order is already marked as paid.', 400)

  const updated = await prisma.order.update({
    where: { id },
    data: { paymentStatus: 'PAID', paidAt: new Date() },
  })

  await createAuditLog({
    action: 'PAYMENT_MARKED_PAID',
    entityType: 'Order',
    entityId: order.id,
    before: { paymentStatus: order.paymentStatus },
    after: { paymentStatus: 'PAID', amount: order.total, note },
  })

  // Best-effort success confirmation — never fails this request.
  let whatsappStatus: 'SENT' | 'FAILED' = 'FAILED'
  let whatsappError: string | undefined
  let whatsappMessageId: string | undefined

  if (!PAYMENT_SUCCESS_TEMPLATE) {
    whatsappError = 'WHATSAPP_PAYMENT_SUCCESS_TEMPLATE_NAME is not configured.'
  } else {
    const { bodyParams } = paymentSuccessTemplateParams(order)
    const result = await sendWhatsAppTemplate({
      to: toWhatsAppPhone(order.shippingPhone),
      templateName: PAYMENT_SUCCESS_TEMPLATE,
      bodyParams,
    })
    if (result.success) {
      whatsappStatus = 'SENT'
      whatsappMessageId = result.messageId
    } else {
      whatsappError = result.error
    }
  }

  await prisma.whatsAppMessage.create({
    data: {
      orderId: order.id,
      phone: order.shippingPhone,
      messageType: 'PAYMENT_SUCCESS',
      status: whatsappStatus,
      providerMessageId: whatsappMessageId,
      errorMessage: whatsappError,
    },
  })

  await createAuditLog({
    action: whatsappStatus === 'SENT' ? 'WHATSAPP_PAYMENT_SENT' : 'WHATSAPP_PAYMENT_FAILED',
    entityType: 'Order',
    entityId: order.id,
    metadata: { messageType: 'PAYMENT_SUCCESS', error: whatsappError },
  })

  return ok({ order: updated, whatsapp: { status: whatsappStatus, error: whatsappError } })
}
