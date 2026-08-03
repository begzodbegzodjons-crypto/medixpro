import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { getCached, setCached, cacheKeys, TTL, invalidateCache } from '@/lib/cache'

const SECRET = process.env.NEXTAUTH_SECRET ?? 'ustoz-pro-dev-secret-change-me-in-production-32chars'

/**
 * Custom JWT encode/decode using HMAC signing instead of JWE encryption.
 * This is more reliable in proxy/sandbox environments where JWE decryption
 * can fail due to cookie handling issues.
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

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            isBlocked: true,
          },
        })

        if (!user) {
          throw new Error('Foydalanuvchi topilmadi')
        }

        if (user.isBlocked) {
          throw new Error('Hisobingiz bloklangan. Admin bilan bog\'laning.')
        }

        if (!user.password) {
          throw new Error('Parol o\'rnatilmagan')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Parol noto\'g\'ri')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  pages: {
    signIn: '/sign-in',
  },
  trustHost: true,
  // Custom JWT encode/decode - HMAC signed, not JWE encrypted
  jwt: {
    encode: async ({ token }) => encode(token),
    decode: async ({ token }) => (token ? decode(token) : null),
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // On initial sign-in, fetch user data
        const dbUser = await db.user.findUnique({
          where: { id: user.id! },
          select: {
            id: true,
            coinBalance: true,
            isAdmin: true,
            isBlocked: true,
            name: true,
            email: true,
          },
        })
        if (dbUser) {
          token.coinBalance = dbUser.coinBalance
          token.isAdmin = dbUser.isAdmin
          token.isBlocked = dbUser.isBlocked
          setCached(cacheKeys.userCoinBalance(dbUser.id), {
            coinBalance: dbUser.coinBalance,
            isAdmin: dbUser.isAdmin,
            isBlocked: dbUser.isBlocked,
          }, TTL.SHORT)
        }
      } else if (token.id) {
        // On subsequent requests, use cached data first
        const userId = token.id as string
        const cached = getCached<{ coinBalance: number; isAdmin: boolean; isBlocked: boolean }>(
          cacheKeys.userCoinBalance(userId)
        )

        if (cached) {
          token.coinBalance = cached.coinBalance
          token.isAdmin = cached.isAdmin
          token.isBlocked = cached.isBlocked
        } else {
          const dbUser = await db.user.findUnique({
            where: { id: userId },
            select: {
              coinBalance: true,
              isAdmin: true,
              isBlocked: true,
            },
          })
          if (dbUser) {
            token.coinBalance = dbUser.coinBalance
            token.isAdmin = dbUser.isAdmin
            token.isBlocked = dbUser.isBlocked
            setCached(cacheKeys.userCoinBalance(userId), {
              coinBalance: dbUser.coinBalance,
              isAdmin: dbUser.isAdmin,
              isBlocked: dbUser.isBlocked,
            }, TTL.SHORT)
          }
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
      if (token?.id) {
        invalidateCache(cacheKeys.userCoinBalance(token.id as string))
      }
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
