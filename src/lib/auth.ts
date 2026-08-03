import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { query } from '@/lib/db'
import type { UserRow } from '@/lib/db-types'
import { toBool } from '@/lib/db-types'
import { getCached, setCached, cacheKeys, TTL, invalidateCache } from '@/lib/cache'

const SECRET = process.env.NEXTAUTH_SECRET ?? 'ustoz-pro-dev-secret-change-me-in-production-32chars'

/**
 * Custom JWT encode/decode using HMAC signing instead of JWE encryption.
 * More reliable in proxy/sandbox environments.
 */
function encode(payload: any): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${signature}`
}

function decode(token: string): any | null {
  try {
    const [data, signature] = token.split('.')
    if (!data || !signature) return null
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (signature !== expectedSignature) return null
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'))
  } catch {
    return null
  }
}

async function fetchUserSessionData(userId: string) {
  // Try cache first
  const cached = getCached<{ coinBalance: number; isAdmin: boolean; isBlocked: boolean }>(
    cacheKeys.userCoinBalance(userId)
  )
  if (cached) return cached

  const rows = await query<UserRow[]>(
    'SELECT id, coinBalance, isAdmin, isBlocked FROM User WHERE id = ?',
    [userId]
  )
  if (rows.length === 0) return null
  const u = rows[0]
  const data = {
    coinBalance: Number(u.coinBalance),
    isAdmin: toBool(u.isAdmin),
    isBlocked: toBool(u.isBlocked),
  }
  setCached(cacheKeys.userCoinBalance(userId), data, TTL.SHORT)
  return data
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email va parol talab qilinadi')
        }
        const email = credentials.email.toLowerCase().trim()

        const rows = await query<UserRow[]>(
          'SELECT id, email, name, image, password, isBlocked FROM User WHERE email = ?',
          [email]
        )
        if (rows.length === 0) throw new Error('Foydalanuvchi topilmadi')

        const user = rows[0]
        if (toBool(user.isBlocked)) {
          throw new Error('Hisobingiz bloklangan. Admin bilan bog\'laning.')
        }
        if (!user.password) throw new Error('Parol o\'rnatilmagan')

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) throw new Error('Parol noto\'g\'ri')

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: '/sign-in' },
  trustHost: true,
  jwt: {
    encode: async ({ token }) => encode(token),
    decode: async ({ token }) => (token ? decode(token) : null),
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: { sameSite: 'lax', path: '/', secure: false },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const data = await fetchUserSessionData(user.id!)
        if (data) {
          token.coinBalance = data.coinBalance
          token.isAdmin = data.isAdmin
          token.isBlocked = data.isBlocked
        }
      } else if (token.id) {
        const data = await fetchUserSessionData(token.id as string)
        if (data) {
          token.coinBalance = data.coinBalance
          token.isAdmin = data.isAdmin
          token.isBlocked = data.isBlocked
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).coinBalance = token.coinBalance as number
        ;(session.user as any).isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  secret: SECRET,
  events: {
    async signOut({ token }) {
      if (token?.id) invalidateCache(cacheKeys.userCoinBalance(token.id as string))
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
