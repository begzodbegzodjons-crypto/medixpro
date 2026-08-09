import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'
import AuthForm from '@/components/auth-form'

export const metadata = { title: 'Kirish — UstozPro' }

export default async function SignInPage() {
  const user = await getCurrentUser()
  if (user?.id) redirect('/')

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/hero-teacher.png" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-neutral-900/80"></div>
      </div>
      {/* Form card */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">UstozPro</h1>
          <p className="text-sm text-neutral-500 mt-1">O'qituvchilar uchun platforma</p>
        </div>
        <AuthForm mode="sign-in" />
      </div>
    </div>
  )
}
