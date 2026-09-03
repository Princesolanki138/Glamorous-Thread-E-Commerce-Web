import { BadgeCheck, Factory, Truck, Wallet } from 'lucide-react'

export default function TrustBadges() {
  const items = [
    {
      title: '100% Human Hair',
      description: 'Premium ethically sourced natural human hair.',
      icon: BadgeCheck,
    },
    {
      title: 'In-House Manufacturing',
      description: 'Crafted with precision by our expert team.',
      icon: Factory,
    },
    {
      title: 'Cash On Delivery',
      description: 'Flexible payment options across India.',
      icon: Wallet,
    },
    {
      title: 'Free Shipping',
      description: 'Complimentary delivery on prepaid orders.',
      icon: Truck,
    },
  ]

  return (
    <section className="border-y border-brand-card bg-[#1A1A1A]">
      <div className="max-w-400 mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className={`group relative px-8 py-14 md:py-16 text-center transition-all duration-500 hover:bg-brand-card ${
                index !== items.length - 1 ? 'xl:border-r border-brand-card' : ''
              }`}
            >
              <div className="mx-auto w-14 h-14 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:border-[#D4D4D4]/40 group-hover:bg-[#2A2A2A]">
                <Icon size={24} strokeWidth={1.5} className="text-[#D4D4D4]" />
              </div>

              <h3 className="mt-6 font-cormorant text-xl md:text-2xl text-white tracking-tight">
                {item.title}
              </h3>

              <p className="mt-3 text-sm text-[#8A8A8A] leading-7 max-w-55 mx-auto">
                {item.description}
              </p>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-[#D4D4D4]/50 transition-all duration-500 group-hover:w-16" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
