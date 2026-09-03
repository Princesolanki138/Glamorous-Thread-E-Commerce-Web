import { SignJWT, jwtVerify } from 'jose'

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

export interface SessionPayload {
  userId: string
  phoneNumber: string
  isAdmin: boolean
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET is missing or too short. Set a random string of at least 32 characters in your environment.',
    )
  }
  return new TextEncoder().encode(secret)
}

/** Signs a session token. HS256 is fixed here — the algorithm is never read from the token. */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret())
}

/**
 * Verifies a session token. Returns null for any invalid/expired/tampered
 * token rather than throwing, so callers can treat it as "not signed in".
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })

    if (
      typeof payload.userId !== 'string' ||
      typeof payload.phoneNumber !== 'string' ||
      typeof payload.isAdmin !== 'boolean'
    ) {
      return null
    }

    return {
      userId: payload.userId,
      phoneNumber: payload.phoneNumber,
      isAdmin: payload.isAdmin,
    }
  } catch {
    return null
  }
}

export { SESSION_MAX_AGE_SECONDS }
