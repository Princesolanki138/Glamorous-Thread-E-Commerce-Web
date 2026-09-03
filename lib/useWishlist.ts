'use client'

import { useState, useCallback } from 'react'
import { useSession } from '@/component/auth/SessionProvider'
import { useRouter } from 'next/navigation'

export function useWishlist(productId: string, initialWishlisted = false) {
  const { isSignedIn } = useSession()
  const router = useRouter()
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [loading, setLoading] = useState(false)

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!isSignedIn) {
        router.push('/auth/login')
        return
      }

      if (loading) return
      setLoading(true)

      const next = !wishlisted
      setWishlisted(next)

      try {
        const res = await fetch(`/api/wishlist/${productId}`, {
          method: next ? 'POST' : 'DELETE',
        })
        if (!res.ok) setWishlisted(!next)
      } catch {
        setWishlisted(!next)
      } finally {
        setLoading(false)
      }
    },
    [isSignedIn, loading, productId, router, wishlisted],
  )

  return { wishlisted, loading, toggle }
}
