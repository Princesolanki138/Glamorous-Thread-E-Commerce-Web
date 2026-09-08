import { z } from 'zod'

// ─── WhatsApp Order ───────────────────────────────────────────────────────────

export const whatsappOrderSchema = z.object({
  // Customer details
  firstName: z.string().min(1, 'First name required'),
  lastName:  z.string().min(1, 'Last name required'),
  phone:     z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email:     z.string().email('Enter a valid email').optional().or(z.literal('')),
  // Address
  line1:     z.string().min(5, 'Address required'),
  line2:     z.string().optional(),
  city:      z.string().min(1, 'City required'),
  state:     z.string().min(1, 'State required'),
  pincode:   z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  country:   z.string().default('India'),
  notes:     z.string().optional(),
  couponCode: z.string().max(64).optional(),
  // Cart
  items: z.array(z.object({
    variantId:       z.string().cuid(),
    quantity:        z.number().int().min(1).max(50),
    price:           z.number().positive(),
    productTitle:    z.string(),
    variantLabel:    z.string().optional(),
    productImageUrl: z.string().url().optional(),
  })).min(1, 'Cart is empty'),
})

export type WhatsAppOrderInput = z.infer<typeof whatsappOrderSchema>

// ─── Lead ─────────────────────────────────────────────────────────────────────

export const leadSchema = z.object({
  name:      z.string().min(2, 'Name required'),
  email:     z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone:     z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  subject:   z.string().optional(),
  message:   z.string().min(5, 'Message required'),
  source:    z.enum(['CONTACT_FORM', 'CONSULTATION_FORM', 'PRODUCT_INQUIRY', 'WHATSAPP_INQUIRY']).optional(),
  productId: z.string().cuid().optional(),
})

export type LeadInput = z.infer<typeof leadSchema>

// ─── Review ───────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  productId: z.string().cuid(),
  rating:    z.number().int().min(1).max(5),
  comment:   z.string().min(10, 'Write at least 10 characters'),
})

export type ReviewInput = z.infer<typeof reviewSchema>

// ─── Product ──────────────────────────────────────────────────────────────────

/**
 * Accepts an absolute URL (e.g. a Cloudinary upload) or a root-relative path
 * for an asset served out of /public, such as an imported catalogue photo.
 */
export const assetUrlSchema = z
  .string()
  .refine(
    (v) => /^https?:\/\//i.test(v) || v.startsWith('/'),
    'Must be an absolute URL or a path beginning with /',
  )

export const productSchema = z.object({
  title:          z.string().min(2),
  slug:           z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description:    z.string().min(10),
  shortDesc:      z.string().optional(),
  price:          z.number().positive(),
  comparePrice:   z.number().positive().optional(),
  collectionId:   z.string().cuid(),
  featured:       z.boolean().default(false),
  isActive:       z.boolean().default(true),
  hairColor:      z.string().optional(),
  hairLength:     z.string().optional(),
  hairStyle:      z.string().optional(),
  hairTexture:    z.string().optional(),
  // Supplier specification table, stored as { "Attribute": "Value" } pairs.
  specs:          z.record(z.string(), z.string()).optional(),
  metaTitle:      z.string().optional(),
  metaDescription:z.string().optional(),
  metaKeywords:   z.string().optional(),
})

export type ProductInput = z.infer<typeof productSchema>

// ─── Variant ──────────────────────────────────────────────────────────────────

export const variantSchema = z.object({
  color:        z.string().optional(),
  length:       z.string().optional(),
  texture:      z.string().optional(),
  sku:          z.string().optional(),
  stock:        z.number().int().min(0),
  price:        z.number().positive().optional(),
  comparePrice: z.number().positive().optional(),
})

export type VariantInput = z.infer<typeof variantSchema>

// ─── Collection ───────────────────────────────────────────────────────────────

export const collectionSchema = z.object({
  title:           z.string().min(2),
  slug:            z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description:     z.string().optional(),
  image:           assetUrlSchema.optional().or(z.literal('')),
  sortOrder:       z.number().int().default(0),
  isActive:        z.boolean().default(true),
  metaTitle:       z.string().optional(),
  metaDescription: z.string().optional(),
})

export type CollectionInput = z.infer<typeof collectionSchema>

// ─── Coupon ───────────────────────────────────────────────────────────────────

export const couponSchema = z.object({
  code:           z.string().min(2).transform((v) => v.toUpperCase()),
  discountType:   z.enum(['PERCENTAGE', 'FIXED']),
  discountValue:  z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  usageLimit:     z.number().int().positive().optional(),
  isActive:       z.boolean().default(true),
  startsAt:       z.string().datetime().optional().or(z.literal('')),
  expiresAt:      z.string().datetime().optional().or(z.literal('')),
})

export type CouponInput = z.infer<typeof couponSchema>

// ─── Order status ─────────────────────────────────────────────────────────────

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'WHATSAPP_SENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

// ─── Lead update (status/notes) ────────────────────────────────────────────────

export const leadUpdateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED']).optional(),
  notes:  z.string().optional(),
})

// ─── Inventory Log ────────────────────────────────────────────────────────────

export const inventoryLogSchema = z.object({
  variantId: z.string().cuid(),
  change:    z.number().int(),
  reason:    z.enum(['STOCK_ADDED','STOCK_REMOVED','STOCK_ADJUSTED','ORDER_PLACED','ORDER_CANCELLED','RETURN']),
  note:      z.string().optional(),
})

export type InventoryLogInput = z.infer<typeof inventoryLogSchema>

// ─── Product Demo ─────────────────────────────────────────────────────────────

export const productDemoSchema = z.object({
  title:        z.string().min(2, 'Title required'),
  videoUrl:     assetUrlSchema,
  posterUrl:    assetUrlSchema.optional().or(z.literal('')),
  collectionId: z.string().cuid('Choose a collection'),
  sortOrder:    z.number().int().default(0),
  isActive:     z.boolean().default(true),
})

export type ProductDemoInput = z.infer<typeof productDemoSchema>

// ─── API response helpers ─────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status })
}

export function err(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status })
}

export function validationErr(error: z.ZodError) {
  return Response.json(
    { success: false, error: 'Validation failed', fields: error.flatten().fieldErrors },
    { status: 422 }
  )
}
