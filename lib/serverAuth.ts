import { NextResponse } from 'next/server'
import { prisma } from './prisma'
import { getSession } from './auth/session'

type AdminCheckResult =
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>> }
  | { ok: false; res: ReturnType<typeof NextResponse.json> }

/**
 * Guard for admin-only API routes.
 *
 * The proxy performs an optimistic redirect for admin *pages*, but API routes
 * are not covered by it, so this re-checks the session and the isAdmin flag
 * against the database on every call.
 */
export async function ensureAdmin(): Promise<AdminCheckResult> {
  try {
    const session = await getSession()
    if (!session) {
      return { ok: false, res: NextResponse.json({ error: 'Must be signed in' }, { status: 401 }) }
    }

    // Re-read from the database rather than trusting the token's isAdmin claim,
    // so a revoked admin loses access immediately instead of at token expiry.
    const dbUser = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!dbUser) {
      return { ok: false, res: NextResponse.json({ error: 'User not found' }, { status: 404 }) }
    }

    if (!dbUser.isAdmin) {
      return { ok: false, res: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) }
    }

    return { ok: true, user: dbUser }
  } catch (err) {
    console.error('ENSURE_ADMIN_ERROR', err)
    return { ok: false, res: NextResponse.json({ error: 'Authorization failed' }, { status: 500 }) }
  }
}
