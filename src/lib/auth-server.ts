import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { query, execute, generateId } from '@/lib/db'
import type { UserRow } from '@/lib/db-types'
import { invalidateCache, cacheKeys } from '@/lib/cache'
import { toBool } from '@/lib/db-types'

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

export async function invalidateUserCache(userId: string) {
  invalidateCache(cacheKeys.userCoinBalance(userId))
}

/**
 * Fetch user by ID with coin balance, isAdmin, isBlocked (cached briefly).
 */
export async function fetchUserSessionData(userId: string) {
  const rows = await query<UserRow[]>(
    'SELECT id, coinBalance, isAdmin, isBlocked FROM User WHERE id = ?',
    [userId]
  )
  if (rows.length === 0) return null
  const u = rows[0]
  return {
    id: u.id,
    coinBalance: Number(u.coinBalance),
    isAdmin: toBool(u.isAdmin),
    isBlocked: toBool(u.isBlocked),
  }
}

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
  const existing = await query<UserRow[]>('SELECT id FROM User WHERE email = ?', [normalizedEmail])
  if (existing.length > 0) {
    throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan')
  }

  const hashedPassword = await hashPassword(password)
  const id = generateId()
  await execute(
    `INSERT INTO User (id, email, name, password, coinBalance, phoneVerified, testsCompletedToday, isAdmin, isBlocked, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0, NOW(), NOW())`,
    [id, normalizedEmail, name?.trim() || null, hashedPassword]
  )

  return { id, email: normalizedEmail, name: name?.trim() || null }
}
