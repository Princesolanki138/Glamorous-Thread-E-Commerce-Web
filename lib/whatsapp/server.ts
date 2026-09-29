import 'server-only'

/**
 * Server-only WhatsApp utilities.
 * These functions read secret env vars (WHATSAPP_ACCESS_TOKEN, etc.).
 * NEVER import this file from a 'use client' component.
 */

// Re-export client-safe functions so server code can import everything from one place
export {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  generateOrderNumber,
} from './order-message'
export type { WhatsAppOrderPayload } from './order-message'

// Server-only exports
export { sendWhatsAppTemplate, toWhatsAppPhone } from './cloudApi'
export type { SendTemplateResult } from './cloudApi'

export { paymentRequestTemplateParams, paymentSuccessTemplateParams } from './templates'

export { sendOtpViaWhatsApp } from './otp-message'
