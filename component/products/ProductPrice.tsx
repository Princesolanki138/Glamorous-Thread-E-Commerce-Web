export default function ProductPrice({
  product,
}: {
  product: { price: number; comparePrice?: number | null }
  /** Accepted for call-site compatibility; pricing is derived from `product`. */
  selectedVariant?: unknown
}) {
  const comparePrice = product.comparePrice || 15199

  const discount = Math.round(
    ((comparePrice - product.price) / comparePrice) * 100
  )

  return (
    <div className="mt-8">
      
      {/* Price Row */}
      <div className="flex flex-wrap items-center gap-4">
        
        {/* Current Price */}
        <span
          className="
            text-3xl
            md:text-4xl
            font-semibold
            tracking-tight
            text-white
          "
        >
          ₹{product.price}
        </span>

        {/* Compare Price */}
        <span
          className="
            line-through
            text-neutral-400
            text-xl
            md:text-2xl
            font-medium
          "
        >
          ₹{comparePrice}
        </span>

        {/* Discount Badge */}
        <span
          className="
            bg-black
            text-white
            text-xs
            md:text-sm
            uppercase
            tracking-[0.18em]
            px-4
            py-2
            rounded-full
            font-medium
          "
        >
          Save {discount}%
        </span>
      </div>

      {/* Tax Info */}
      <p
        className="
          mt-4
          text-sm
          text-neutral-500
          leading-relaxed
        "
      >
        Inclusive of all taxes & duties.
      </p>

      
    </div>
  )
}