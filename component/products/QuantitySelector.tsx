'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

type Props = {
  quantity?: number
  onIncrease?: () => void
  onDecrease?: () => void
}

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
}: Props) {
  const [internalQuantity, setInternalQuantity] = useState(1)
  const currentQuantity = quantity ?? internalQuantity

  const increaseQuantity = () => {
    if (onIncrease) {
      onIncrease()
    } else {
      setInternalQuantity((prev: number) => prev + 1)
    }
  }

  const decreaseQuantity = () => {
    if (currentQuantity > 1) {
      if (onDecrease) {
        onDecrease()
      } else {
        setInternalQuantity((prev: number) => prev - 1)
      }
    }
  }

  return (
    <div className="mt-10">
      
      {/* Label */}
      <div className="flex items-center justify-between mb-5">
        
        <h3
          className="
            uppercase
            tracking-[0.28em]
            text-xs
            md:text-sm
            text-neutral-500
            font-medium
          "
        >
          Quantity
        </h3>

        <span className="text-sm text-neutral-400">
          In Stock
        </span>
      </div>

      {/* Selector */}
      <div
        className="
          inline-flex
          items-center
          rounded-2xl
          border
          border-neutral-200
          bg-white
          overflow-hidden
          shadow-sm
        "
      >
        {/* Minus */}
        <button
          onClick={decreaseQuantity}
          disabled={currentQuantity === 1}
          className="
            w-14
            h-14
            flex
            items-center
            justify-center
            transition-all
            duration-300
            hover:bg-black
            hover:text-white
            disabled:opacity-40
            disabled:hover:bg-transparent
            disabled:hover:text-black
          "
        >
          <Minus size={18} />
        </button>

        {/* Quantity */}
        <div
          className="
            min-w-[70px]
            text-center
            text-lg
            font-medium
            text-black
            select-none
          "
        >
          {currentQuantity}
        </div>

        {/* Plus */}
        <button
          onClick={increaseQuantity}
          className="
            w-14
            h-14
            flex
            items-center
            justify-center
            transition-all
            duration-300
            hover:bg-black
            hover:text-white
          "
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Small Helper Text */}
      <p className="mt-4 text-sm text-neutral-500">
        Adjust quantity before adding to cart.
      </p>
    </div>
  )
}