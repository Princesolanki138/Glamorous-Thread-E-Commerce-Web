import 'server-only'
import { sendWhatsAppTemplate, toWhatsAppPhone, type SendTemplateResult } from './cloudApi'

/**
 * Delivers a login OTP over WhatsApp using the existing Cloud API sender.
 *
 * Meta's authentication templates take the code as the single body variable
 * and, when a copy-code button is present, the same value again as the button
 * parameter. Never throws — delivery failures are returned so the caller decides.
 */
export async function sendOtpViaWhatsApp(phoneNumber: string, code: string): Promise<SendTemplateResult> {
  const otpTemplate = process.env.WHATSAPP_OTP_TEMPLATE_NAME
  const templateHasButton = process.env.WHATSAPP_OTP_TEMPLATE_HAS_BUTTON !== 'false'

  if (!otpTemplate) {
    return { success: false, error: 'WHATSAPP_OTP_TEMPLATE_NAME is not configured.' }
  }

  return sendWhatsAppTemplate({
    to: toWhatsAppPhone(phoneNumber),
    templateName: otpTemplate,
    bodyParams: [code],
    ...(templateHasButton ? { buttonUrlParam: code } : {}),
  })
}
