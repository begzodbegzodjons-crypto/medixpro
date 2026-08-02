import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

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
  const existing = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (existing) {
    throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan')
  }

  const hashedPassword = await hashPassword(password)
  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
    },
  })

  return user
}
