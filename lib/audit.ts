import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
import { headers } from 'next/headers'

export type AuditAction =
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'PRODUCT_BULK_IMPORT'
  | 'COLLECTION_CREATED'
  | 'COLLECTION_UPDATED'
  | 'COLLECTION_DELETED'
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_UPDATED'
  | 'USER_ROLE_UPDATED'
  | 'USER_DELETED'
  | 'SETTINGS_UPDATED'
  | 'COUPON_CREATED'
  | 'COUPON_UPDATED'
  | 'COUPON_DELETED'
  | 'REVIEW_DELETED'
  | 'PRODUCT_DEMO_CREATED'
  | 'PRODUCT_DEMO_UPDATED'
  | 'PRODUCT_DEMO_DELETED'
  | 'REVIEW_APPROVED'
  | 'REVIEW_REJECTED'
  | 'USER_REGISTERED'
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'ORDER_CONFIRMED'
  | 'PAYMENT_REQUEST_SENT'
  | 'PAYMENT_REQUEST_RESENT'
  | 'PAYMENT_MARKED_PAID'
  | 'WHATSAPP_PAYMENT_SENT'
  | 'WHATSAPP_PAYMENT_FAILED'

export interface AuditLogData {
  action: AuditAction | string
  entityType?: string
  entityId?: string
  before?: Prisma.InputJsonValue
  after?: Prisma.InputJsonValue
  metadata?: Prisma.InputJsonValue
  targetUserId?: string
  actorId?: string
}

export async function createAuditLog(data: AuditLogData) {
  try {
    let actorId: string | undefined = data.actorId

    // Resolve the actor from the current session cookie.
    if (!actorId) {
      try {
        const session = await getSession()
        actorId = session?.userId
      } catch {
        // getSession() reads cookies, which fails outside a request context
      }
    }

    // No actor resolved (e.g. a webhook / system-triggered event) — write the
    // log with a null actor rather than dropping it. `AuditLog.actorId` is
    // nullable for exactly this case.

    let ipAddress: string | undefined
    let userAgent: string | undefined

    try {
      const headersList = await headers()

      ipAddress =
        headersList.get('x-forwarded-for') ||
        headersList.get('x-real-ip') ||
        undefined

      userAgent =
        headersList.get('user-agent') ||
        undefined
    } catch {
      // No request context available
    }

    return await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,

        // Store JSON directly
        before: data.before ?? Prisma.JsonNull,
        after: data.after ?? Prisma.JsonNull,
        metadata: data.metadata ?? {},

        ipAddress,
        userAgent,

        actorId,
        targetUserId: data.targetUserId,
      },

      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    return null
  }
}

export async function getEntityBeforeUpdate<T>(
  model: { findUnique: (args: { where: { id: string } }) => Promise<T | null> },
  id: string
): Promise<T | null> {
  try {
    return await model.findUnique({
      where: { id },
    })
  } catch (error) {
    console.error(
      'Failed to fetch entity before update:',
      error
    )
    return null
  }
}