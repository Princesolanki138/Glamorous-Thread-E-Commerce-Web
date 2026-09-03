'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'
import { useRouter } from 'next/navigation'

export interface SessionUser {
  id: string
  phoneNumber: string
  isAdmin: boolean
}

interface SessionContextValue {
  user: SessionUser | null
  isSignedIn: boolean
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  isSignedIn: false,
  signOut: async () => {},
})

/**
 * Holds the current session for client components.
 *
 * The initial value is resolved on the server in app/layout.tsx and passed in
 * as a prop, so the signed-in state is correct in the first render and there
 * is no hydration mismatch or post-mount flash.
 */
export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null
  children: React.ReactNode
}) {
  const router = useRouter()

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }, [router])

  const value = useMemo(
    () => ({ user, isSignedIn: user !== null, signOut }),
    [user, signOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}
