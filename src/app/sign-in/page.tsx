import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'
import AuthForm from '@/components/auth-form'

export const metadata = { title: 'Kirish — UstozPro' }

export default async function SignInPage() {
  const user = await getCurrentUser()
  if (user?.id) redirect('/')
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-white">
      <AuthForm mode="sign-in" />
    </main>
  )
}
