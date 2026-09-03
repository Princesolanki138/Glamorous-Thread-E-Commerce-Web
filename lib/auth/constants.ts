/**
 * Auth constants with no server-only imports.
 *
 * proxy.ts must not pull in Prisma or `next/headers`, so anything the proxy
 * needs lives here rather than in session.ts.
 */
export const SESSION_COOKIE = 'gemeria_session'
