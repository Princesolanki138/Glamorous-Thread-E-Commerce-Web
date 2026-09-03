import SectionHeading from './SectionHeading'
import ProductCard from './ProductCard'

export default function RecentlyViewed() {
  const products = [
    {
      id: 1,
      title: 'Classic Hair Topper',
      slug: 'classic-hair-topper',
      collection: 'Hair Toppers',
      price: '12,999',
      comparePrice: '15,199',
      image:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
      reviews: 124,
    },
    {
      id: 2,
      title: 'Invisible Clip Extensions',
      slug: 'invisible-clip-extensions',
      collection: 'Hair Extensions',
      price: '9,499',
      comparePrice: '11,999',
      image:
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
      reviews: 98,
    },
    {
      id: 3,
      title: 'Natural Volume Wig',
      slug: 'natural-volume-wig',
      collection: 'Luxury Wigs',
      price: '18,999',
      comparePrice: '22,499',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      reviews: 203,
    },
    {
      id: 4,
      title: 'Silk Base Hair Patch',
      slug: 'silk-base-hair-patch',
      collection: 'Hair Patches',
      price: '14,499',
      comparePrice: '17,299',
      image:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9',
      reviews: 76,
    },
  ]

  return (
    <section className="py-24 md:py-32 px-5 md:px-10 lg:px-16 bg-white">
      
      {/* Header */}
      <div className="flex items-end justify-between gap-6 mb-14">
        
        <div>
          <p
            className="
              uppercase
              tracking-[0.35em]
              text-xs
              text-neutral-500
              mb-4
            "
          >
            Continue Shopping
          </p>

          <SectionHeading title="Recently Viewed" />
        </div>

        <button
          className="
            hidden
            md:flex
            items-center
            gap-2
            text-sm
            font-medium
            text-black
            transition-all
            duration-300
            hover:gap-3
          "
        >
          View All
          <span>→</span>
        </button>
      </div>

      {/* Products */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-8
        "
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  )
}