import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { SESSION_MAX_AGE_SECONDS, signSessionToken, verifySessionToken, type SessionPayload } from './jwt'
import { SESSION_COOKIE } from './constants'

export { SESSION_COOKIE } from './constants'

/**
 * Reads and verifies the session from the request cookie.
 * Returns null when there is no valid session.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

/**
 * Resolves the full user record for the current session.
 * Returns null if the session is absent or the user no longer exists.
 */
export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  return prisma.user.findUnique({ where: { id: session.userId } })
}

/** Issues a session cookie for the given user. */
export async function createSession(payload: SessionPayload) {
  const token = await signSessionToken(payload)
  const store = await cookies()

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

/** Clears the session cookie (sign out). */
export async function destroySession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
