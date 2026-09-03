interface TemplateOrder {
  orderNumber: string
  shippingName: string
  total: number
}

function formatInr(amount: number) {
  return amount.toLocaleString('en-IN')
}

/**
 * Body variables for the payment-request template. There's no payment
 * gateway/link — the approved template's own static text carries the "how
 * to pay" instructions (UPI ID, etc.); these are just the order-specific
 * variables it's filled in with.
 */
export function paymentRequestTemplateParams(order: TemplateOrder) {
  return {
    bodyParams: [order.shippingName, order.orderNumber, formatInr(order.total)],
  }
}

export function paymentSuccessTemplateParams(order: TemplateOrder) {
  return {
    bodyParams: [order.shippingName, order.orderNumber, formatInr(order.total)],
  }
}
