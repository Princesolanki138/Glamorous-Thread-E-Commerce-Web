import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdmin } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'
import { ok, err } from '@/lib/validations'
import { sendWhatsAppTemplate, paymentRequestTemplateParams, toWhatsAppPhone } from '@/lib/whatsapp'

const PAYMENT_REQUEST_TEMPLATE = process.env.WHATSAPP_PAYMENT_TEMPLATE_NAME

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await ensureAdmin()
  if (!check.ok) return check.res

  const { id } = await params

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) return err('Order not found', 404)

  if (order.status === 'CANCELLED') return err('Cannot confirm a cancelled order.', 400)
  if (order.paymentStatus === 'PAID') return err('Order is already paid.', 400)

  // Idempotent — re-running this after a prior WhatsApp-send failure is safe,
  // it's a no-op on the order fields once already CONFIRMED/PAYMENT_PENDING.
  if (order.status === 'PENDING' || order.status === 'WHATSAPP_SENT') {
    await prisma.order.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: order.paymentStatus === 'UNPAID' ? 'PAYMENT_PENDING' : order.paymentStatus,
      },
    })
    await createAuditLog({
      action: 'ORDER_CONFIRMED',
      entityType: 'Order',
      entityId: id,
      before: { status: order.status },
      after: { status: 'CONFIRMED' },
    })
  }

  // Best-effort WhatsApp send — a failure here must not fail this request;
  // the order confirmation above already succeeded, and the admin can
  // resend from this order's page.
  let whatsappStatus: 'SENT' | 'FAILED' = 'FAILED'
  let whatsappError: string | undefined
  let whatsappMessageId: string | undefined

  if (!PAYMENT_REQUEST_TEMPLATE) {
    whatsappError = 'WHATSAPP_PAYMENT_TEMPLATE_NAME is not configured.'
  } else {
    const { bodyParams } = paymentRequestTemplateParams(order)
    const result = await sendWhatsAppTemplate({
      to: toWhatsAppPhone(order.shippingPhone),
      templateName: PAYMENT_REQUEST_TEMPLATE,
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
      messageType: 'PAYMENT_REQUEST',
      status: whatsappStatus,
      providerMessageId: whatsappMessageId,
      errorMessage: whatsappError,
    },
  })

  await createAuditLog({
    action: whatsappStatus === 'SENT' ? 'WHATSAPP_PAYMENT_SENT' : 'WHATSAPP_PAYMENT_FAILED',
    entityType: 'Order',
    entityId: order.id,
    metadata: { messageType: 'PAYMENT_REQUEST', error: whatsappError },
  })

  const updatedOrder = await prisma.order.findUnique({ where: { id } })

  return ok({ order: updatedOrder, whatsapp: { status: whatsappStatus, error: whatsappError } })
}
