import { destroySession } from '@/lib/auth/session'
import { ok } from '@/lib/validations'

export async function POST() {
  await destroySession()
  return ok({ signedOut: true })
}
