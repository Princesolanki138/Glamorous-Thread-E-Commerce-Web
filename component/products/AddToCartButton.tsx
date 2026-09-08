'use client'

import {
  ShoppingBag,
  Check,
  Loader2,
} from 'lucide-react'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { useCartStore } from '@/cart/cartStore'

type Product = {
  id: string
  title: string
  price: number
  image?: string
  images?: string[]
}

type Variant = {
  id: string
  price?: number
  image?: string
  length?: string
}

type Props = {
  product: Product

  selectedVariant?: Variant | null

  quantity?: number

  color?: string

  texture?: string

  length?: string
}

export default function AddToCartButton({

  product,

  selectedVariant,

  quantity = 1,

  color,

  texture,

  length,

}: Props) {

  //
  // CART STORE
  //

  const addToCart =
    useCartStore(
      (state) =>
        state.addToCart
    )

  //
  // STATES
  //

  const [added, setAdded] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  //
  // TIMEOUT REF
  //

  const timeoutRef =
    useRef<
      NodeJS.Timeout | undefined
    >(undefined)

  //
  // CLEANUP
  //

  useEffect(() => {

    return () => {

      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current
        )
      }
    }

  }, [])

  //
  // CURRENT PRICE
  //

  const currentPrice =
    selectedVariant?.price ??
    product.price

  //
  // FORMAT PRICE
  //

  const formattedPrice =
    new Intl.NumberFormat(
      'en-IN'
    ).format(currentPrice)

  //
  // CURRENT IMAGE
  //

  const currentImage =

    selectedVariant?.image ||

    product.image ||

    product.images?.[0] ||

    '/images/placeholder.png'

  //
  // VALIDATION
  //

  const isDisabled =
    !selectedVariant ||
    loading

  //
  // HANDLE ADD TO CART
  //

  const handleAddToCart =
    async () => {

      if (
        !selectedVariant ||
        loading
      ) {
        return
      }

      try {

        setLoading(true)

        //
        // PREMIUM UX DELAY
        //

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              500
            )
        )

        //
        // ADD TO CART
        //

        addToCart({

          productId:
            product.id,

          variantId:
            selectedVariant.id,

          title:
            product.title,

          price:
            currentPrice,

          image:
            currentImage,

          quantity,

          color,

          texture,

          length:
            selectedVariant.length ||
            length,
        })

        //
        // SUCCESS STATE
        //

        setAdded(true)

        timeoutRef.current =
          setTimeout(() => {

            setAdded(false)

          }, 2000)

      } finally {

        setLoading(false)
      }
    }

  return (

    <button

      type="button"

      aria-label="Add product to cart"

      onClick={
        handleAddToCart
      }

      disabled={
        isDisabled
      }

      className={`
        group
        relative
        overflow-hidden
        w-full
        py-5
        rounded-full
        text-sm
        md:text-base
        font-medium
        uppercase
        tracking-[0.22em]
        mt-8
        border
        flex
        items-center
        justify-center
        gap-3
        transition-all
        duration-300

        ${
          isDisabled

            ? `
              bg-neutral-300
              border-neutral-300
              text-white
              cursor-not-allowed
              opacity-70
            `

            : `
              bg-black
              border-black
              text-white
              hover:bg-neutral-900
              hover:shadow-2xl
              active:scale-[0.985]
              shadow-lg
            `
        }
      `}
    >

      {/* SHINE EFFECT */}

      {!isDisabled && (

        <div
          className="
            absolute
            inset-0
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-500
          "
        >
          <div
            className="
              absolute
              inset-y-0
              -left-full
              w-1/2
              bg-white/10
              skew-x-12
              group-hover:left-[140%]
              transition-all
              duration-1000
            "
          />
        </div>
      )}

      {/* LOADING */}

      {loading ? (

        <>
          <Loader2
            size={18}
            className="
              relative
              z-10
              animate-spin
            "
          />

          <span className="relative z-10">
            Adding...
          </span>
        </>

      ) : added ? (

        <>
          <Check
            size={18}
            className="relative z-10"
          />

          <span className="relative z-10">
            Added To Cart
          </span>
        </>

      ) : (

        <>
          {/* ICON */}

          <ShoppingBag
            size={18}
            className="
              relative
              z-10
              transition-transform
              duration-300
              group-hover:scale-110
            "
          />

          {/* TEXT */}

          <span className="relative z-10">

            {
              selectedVariant
                ? 'Add To Cart'
                : 'Unavailable'
            }

          </span>

          {/* DOT */}

          {selectedVariant && (

            <span className="relative z-10 opacity-50">
              •
            </span>
          )}

          {/* PRICE */}

          {selectedVariant && (

            <span className="relative z-10">
              ₹{formattedPrice}
            </span>
          )}
        </>
      )}
    </button>
  )
}