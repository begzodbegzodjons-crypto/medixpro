import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

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

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // Load fresh user data on first sign-in
        const dbUser = await db.user.findUnique({ where: { id: user.id! } })
        if (dbUser) {
          token.coinBalance = dbUser.coinBalance
          token.isAdmin = dbUser.isAdmin
        }
      } else if (token.id) {
        // Refresh coin balance on each request
        const dbUser = await db.user.findUnique({ where: { id: token.id as string } })
        if (dbUser) {
          token.coinBalance = dbUser.coinBalance
          token.isAdmin = dbUser.isAdmin
          token.isBlocked = dbUser.isBlocked
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
  secret: process.env.NEXTAUTH_SECRET ?? 'ustoz-pro-dev-secret-change-me-in-production-32chars',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
