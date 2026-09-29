/**
 * Client-safe WhatsApp utilities.
 * These functions use ONLY NEXT_PUBLIC_ env vars or take all data as parameters.
 * Safe to import from 'use client' components.
 */
export {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  generateOrderNumber,
} from './order-message'

export type { WhatsAppOrderPayload } from './order-message'
