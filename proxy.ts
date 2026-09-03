import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/auth/jwt'
import { SESSION_COOKIE } from '@/lib/auth/constants'

const PROTECTED_PREFIXES = ['/account', '/user-profile', '/checkout', '/orders', '/admin']

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/**
 * Optimistic auth check.
 *
 * Per the Next.js docs, Proxy should not be the only authorization layer — it
 * just redirects signed-out visitors away from protected pages. Real checks
 * still happen in the pages/routes themselves (see lib/serverAuth.ts and the
 * admin layout, which re-read isAdmin from the database).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!isProtected(pathname)) return NextResponse.next()

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = token ? await verifySessionToken(token) : null

  if (!session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Only run the proxy on protected routes - cheaper than matching every
// request, and avoids relying on a broad negative-lookahead pattern.
export const config = {
  matcher: [
    '/account',
    '/account/:path*',
    '/user-profile',
    '/user-profile/:path*',
    '/checkout',
    '/checkout/:path*',
    '/orders',
    '/orders/:path*',
    '/admin',
    '/admin/:path*',
  ],
}
