import 'server-only'

/** Reads WhatsApp Cloud API config at call time, not at import time. */
function waConfig() {
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
  }
}

/** Normalizes a stored 10-digit Indian phone number into the E.164-ish form the WhatsApp API expects. */
export function toWhatsAppPhone(phone: string) {
  return phone.length === 10 ? `91${phone}` : phone
}

interface SendTemplateParams {
  to: string
  templateName: string
  languageCode?: string
  bodyParams: string[]
  buttonUrlParam?: string
}

export type SendTemplateResult =
  | { success: true; messageId: string }
  | { success: false; error: string }

/**
 * Sends an approved WhatsApp template message via Meta's Graph API.
 * Never throws — a misconfigured or failing send must not fail the caller's
 * order/payment operation, so failures are returned, not raised.
 */
export async function sendWhatsAppTemplate(params: SendTemplateParams): Promise<SendTemplateResult> {
  const { accessToken, phoneNumberId, apiVersion } = waConfig()
  if (!accessToken || !phoneNumberId) {
    return { success: false, error: 'WhatsApp Business API is not configured (missing WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID).' }
  }

  const components: Record<string, unknown>[] = [
    {
      type: 'body',
      parameters: params.bodyParams.map((text) => ({ type: 'text', text })),
    },
  ]

  if (params.buttonUrlParam) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: params.buttonUrlParam }],
    })
  }

  try {
    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: params.to,
        type: 'template',
        template: {
          name: params.templateName,
          language: { code: params.languageCode ?? 'en' },
          components,
        },
      }),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok || !data) {
      const message = data?.error?.message || `WhatsApp send failed (${res.status})`
      return { success: false, error: message }
    }

    const messageId = data?.messages?.[0]?.id
    if (!messageId) {
      return { success: false, error: 'WhatsApp API returned no message id.' }
    }

    return { success: true, messageId }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'WhatsApp send failed.' }
  }
}
