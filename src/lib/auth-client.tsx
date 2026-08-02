'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { signOut as nextAuthSignOut } from 'next-auth/react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

export { useSession }

export async function signOut() {
  await nextAuthSignOut({ redirect: false })
}
