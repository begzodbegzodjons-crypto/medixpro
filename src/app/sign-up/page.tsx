import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'
import AuthForm from '@/components/auth-form'

export const metadata = { title: "Ro'yxatdan o'tish — UstozPro" }

export default async function SignUpPage() {
  const user = await getCurrentUser()
  if (user?.id) redirect('/')
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-white">
      <AuthForm mode="sign-up" />
    </main>
  )
}
