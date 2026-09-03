export {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  generateOrderNumber,
} from './order-message'

export type { WhatsAppOrderPayload } from './order-message'

export { sendWhatsAppTemplate, toWhatsAppPhone } from './cloudApi'
export type { SendTemplateResult } from './cloudApi'

export { paymentRequestTemplateParams, paymentSuccessTemplateParams } from './templates'

export { sendOtpViaWhatsApp } from './otp-message'
