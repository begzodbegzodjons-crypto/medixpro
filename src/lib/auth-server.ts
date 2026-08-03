import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { invalidateCache, cacheKeys } from '@/lib/cache'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user?.id) throw new Error('Avtorizatsiya talab qilinadi')
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (!(user as any).isAdmin) throw new Error('Admin huquqlari talab qilinadi')
  return user
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Update user's coin balance and invalidate the cached balance.
 * Use this for any balance-changing operation (purchases, rewards, redemptions).
 */
export async function updateUserCoins(
  userId: string,
  newBalance: number,
  options?: { balanceBefore?: number; balanceAfter?: number }
) {
  await db.user.update({
    where: { id: userId },
    data: { coinBalance: newBalance },
  })
  // Invalidate cached balance so next session check fetches fresh value
  invalidateCache(cacheKeys.userCoinBalance(userId))
}

/**
 * Sign up a new user with email/password
 */
export async function createUser({
  email,
  password,
  name,
}: {
  email: string
  password: string
  name?: string
}) {
  const normalizedEmail = email.toLowerCase().trim()
  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
  })
  if (existing) {
    throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan')
  }

  const hashedPassword = await hashPassword(password)
  const user = await db.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      name: name?.trim() || null,
    },
  })

  return user
}
