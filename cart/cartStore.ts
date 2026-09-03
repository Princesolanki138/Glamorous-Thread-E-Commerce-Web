'use client'

import { create } from 'zustand'

import { persist }
  from 'zustand/middleware'

//
// CART ITEM
//

export type CartItem = {

  //
  // PRODUCT
  //

  productId: string

  //
  // VARIANT
  //

  variantId: string

  //
  // DISPLAY
  //

  title: string

  image: string

  //
  // UI PRICE ONLY
  // NEVER TRUST THIS ON BACKEND
  //

  price: number

  //
  // QUANTITY
  //

  quantity: number

  //
  // VARIANTS
  //

  color?: string

  texture?: string

  length?: string
}

//
// STORE
//

type CartStore = {

  cart: CartItem[]

  isOpen: boolean

  //
  // UI
  //

  openCart: () => void

  closeCart: () => void

  //
  // CART ACTIONS
  //

  addToCart: (
    product: CartItem
  ) => void

  removeFromCart: (
    variantId: string
  ) => void

  increaseQuantity: (
    variantId: string
  ) => void

  decreaseQuantity: (
    variantId: string
  ) => void

  clearCart: () => void

  //
  // CALCULATIONS
  //

  getSubtotal: () => number

  getTotalItems: () => number
}

//
// STORE
//

export const useCartStore =
  create<CartStore>()(

    persist(

      (set, get) => ({

        //
        // STATE
        //

        cart: [],

        isOpen: false,

        //
        // UI
        //

        openCart: () =>

          set({
            isOpen: true,
          }),

        closeCart: () =>

          set({
            isOpen: false,
          }),

        //
        // ADD TO CART
        //

        addToCart: (
          product
        ) =>

          set((state) => {

            //
            // CHECK EXISTING VARIANT
            //

            const existingItem =
              state.cart.find(
                (item) =>
                  item.variantId ===
                  product.variantId
              )

            //
            // ALREADY EXISTS
            //

            if (existingItem) {

              return {

                cart:
                  state.cart.map(
                    (item) =>

                      item.variantId ===
                      product.variantId

                        ? {
                            ...item,

                            quantity:
                              item.quantity +
                              product.quantity,
                          }

                        : item
                  ),

                isOpen: true,
              }
            }

            //
            // NEW ITEM
            //

            return {

              cart: [
                ...state.cart,
                product,
              ],

              isOpen: true,
            }
          }),

        //
        // REMOVE ITEM
        //

        removeFromCart: (
          variantId
        ) =>

          set((state) => ({

            cart:
              state.cart.filter(
                (item) =>
                  item.variantId !==
                  variantId
              ),
          })),

        //
        // INCREASE QUANTITY
        //

        increaseQuantity: (
          variantId
        ) =>

          set((state) => ({

            cart:
              state.cart.map(
                (item) =>

                  item.variantId ===
                  variantId

                    ? {
                        ...item,

                        quantity:
                          item.quantity + 1,
                      }

                    : item
              ),
          })),

        //
        // DECREASE QUANTITY
        //

        decreaseQuantity: (
          variantId
        ) =>

          set((state) => ({

            cart:
              state.cart

                .map(
                  (item) =>

                    item.variantId ===
                    variantId

                      ? {
                          ...item,

                          quantity:
                            item.quantity - 1,
                        }

                      : item
                )

                .filter(
                  (item) =>
                    item.quantity > 0
                ),
          })),

        //
        // CLEAR CART
        //

        clearCart: () =>

          set({
            cart: [],
          }),

        //
        // SUBTOTAL
        //

        getSubtotal: () => {

          return get().cart.reduce(

            (
              total,
              item
            ) =>

              total +
              item.price *
                item.quantity,

            0
          )
        },

        //
        // TOTAL ITEMS
        //

        getTotalItems: () => {

          return get().cart.reduce(

            (
              total,
              item
            ) =>

              total + item.quantity,

            0
          )
        },
      }),

      {
        name:
          'gemeria-hair-cart',
      }
    )
  )

