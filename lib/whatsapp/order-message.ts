const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER ?? '918104834173'

const DIV = '━━━━━━━━━━━━━━━'

export interface WhatsAppOrderPayload {
  orderNumber: string
  createdAt:   Date
  customer: {
    name:   string
    phone:  string
    email?: string
  }
  address: {
    line1:   string
    line2?:  string
    city:    string
    state:   string
    pincode: string
    country: string
  }
  items: {
    productTitle:  string
    variantLabel?: string
    quantity:      number
    price:         number
  }[]
  subtotal: number
  shipping: number
  discount?: number
  couponCode?: string
  total:    number
  notes?:   string
}

export function buildWhatsAppMessage(order: WhatsAppOrderPayload): string {
  const date = order.createdAt.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  // Build product blocks — each field on its own line
  const productBlocks = order.items.map((item, i) => {
    const lines: string[] = []
    if (order.items.length > 1) lines.push(`[${i + 1}]`)
    lines.push(item.productTitle)
    lines.push('')
    if (item.variantLabel) {
      lines.push('Variant:')
      lines.push(item.variantLabel)
      lines.push('')
    }
    lines.push('Quantity:')
    lines.push(String(item.quantity))
    lines.push('')
    lines.push('Price:')
    lines.push(`₹${(item.price * item.quantity).toLocaleString('en-IN')}`)
    return lines.join('\n')
  })

  const shippingLine =
    order.shipping === 0
      ? 'FREE'
      : `₹${order.shipping.toLocaleString('en-IN')}`

  const lines: string[] = [
    '🛍️ NEW ORDER',
    '',
    DIV,
    '',
    'ORDER DETAILS',
    '',
    'Order ID:',
    order.orderNumber,
    '',
    'Order Date:',
    date,
    '',
    DIV,
    '',
    'CUSTOMER DETAILS',
    '',
    'Name:',
    order.customer.name,
    '',
    'Phone:',
    order.customer.phone,
  ]

  if (order.customer.email) {
    lines.push('', 'Email:', order.customer.email)
  }

  lines.push(
    '',
    DIV,
    '',
    'SHIPPING ADDRESS',
    '',
    order.address.line1,
  )

  if (order.address.line2) {
    lines.push('', order.address.line2)
  }

  lines.push(
    '',
    order.address.city,
    '',
    order.address.state,
    '',
    order.address.pincode,
    '',
    order.address.country,
    '',
    DIV,
    '',
    'PRODUCTS',
    '',
    productBlocks.join('\n\n---\n\n'),
    '',
    DIV,
    '',
    'ORDER SUMMARY',
    '',
    'Subtotal:',
    `₹${order.subtotal.toLocaleString('en-IN')}`,
    '',
  )

  if (order.discount && order.discount > 0) {
    lines.push(
      order.couponCode ? `Discount (${order.couponCode}):` : 'Discount:',
      `-₹${order.discount.toLocaleString('en-IN')}`,
      '',
    )
  }

  lines.push(
    'Shipping:',
    shippingLine,
    '',
    'Total:',
    `₹${order.total.toLocaleString('en-IN')}`,
  )

  if (order.notes) {
    lines.push(
      '',
      DIV,
      '',
      'CUSTOMER NOTES',
      '',
      order.notes,
    )
  }

  lines.push(
    '',
    DIV,
    '',
    'Please confirm product availability and next steps.',
  )

  return lines.join('\n')
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function generateOrderNumber(sequenceId: number): string {
  const year = new Date().getFullYear()
  const seq  = String(sequenceId).padStart(5, '0')
  return `GH-${year}-${seq}`
}
