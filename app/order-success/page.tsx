import Link from 'next/link'
import { CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react'
import WhatsAppAutoOpen from '@/component/checkout/WhatsAppAutoOpen'

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order } = await searchParams

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">

        <div className="w-20 h-20 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10 text-[#25D366]" strokeWidth={1.5} />
        </div>

        <h1 className="font-cormorant text-4xl text-white tracking-tight mb-3">
          Order Placed!
        </h1>

        {order && (
          <p className="text-[#555555] text-sm uppercase tracking-widest mb-2">
            Order ID: <span className="text-[#D4D4D4]">{order}</span>
          </p>
        )}

        <p className="text-[#8A8A8A] text-sm leading-relaxed mb-8">
          Your order has been saved. Open WhatsApp below to send your order details
          to our team and confirm your purchase.
        </p>

        {/* Client component: reads sessionStorage and auto-opens WhatsApp */}
        <WhatsAppAutoOpen />

        <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4 mb-8 text-left">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-4 h-4 text-[#555555] shrink-0 mt-0.5" />
            <div>
              <p className="text-[#8A8A8A] text-xs leading-relaxed">
                Need to reach us directly?{' '}
                <a
                  href="https://wa.me/918104834173"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:underline"
                >
                  Chat on WhatsApp
                </a>
                {' '}and share your order ID.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/orders"
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-medium text-sm py-3.5 px-6 rounded-xl hover:bg-[#D4D4D4] transition-colors"
          >
            View My Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 border border-[#2A2A2A] text-[#8A8A8A] hover:text-white hover:border-[#555555] font-medium text-sm py-3.5 px-6 rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
