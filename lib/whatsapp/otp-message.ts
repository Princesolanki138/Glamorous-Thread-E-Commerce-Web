import { sendWhatsAppTemplate, toWhatsAppPhone, type SendTemplateResult } from './cloudApi'

const OTP_TEMPLATE = process.env.WHATSAPP_OTP_TEMPLATE_NAME

/**
 * Whether the approved OTP template carries a copy-code / autofill button.
 *
 * Meta rejects a send whose components don't match the approved template, so
 * this has to line up with what was actually created: sending a button
 * parameter to a body-only template fails, and omitting it for a template that
 * has a button fails too. Authentication templates normally include the
 * button, so that's the default — set WHATSAPP_OTP_TEMPLATE_HAS_BUTTON=false
 * if you created a body-only template.
 */
const TEMPLATE_HAS_BUTTON = process.env.WHATSAPP_OTP_TEMPLATE_HAS_BUTTON !== 'false'

/**
 * Delivers a login OTP over WhatsApp using the existing Cloud API sender.
 *
 * Meta's authentication templates take the code as the single body variable
 * and, when a copy-code button is present, the same value again as the button
 * parameter. Never throws — delivery failures are returned so the caller decides.
 */
export async function sendOtpViaWhatsApp(phoneNumber: string, code: string): Promise<SendTemplateResult> {
  if (!OTP_TEMPLATE) {
    return { success: false, error: 'WHATSAPP_OTP_TEMPLATE_NAME is not configured.' }
  }

  return sendWhatsAppTemplate({
    to: toWhatsAppPhone(phoneNumber),
    templateName: OTP_TEMPLATE,
    bodyParams: [code],
    ...(TEMPLATE_HAS_BUTTON ? { buttonUrlParam: code } : {}),
  })
}
