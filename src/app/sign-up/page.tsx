import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'
import AuthForm from '@/components/auth-form'

export const metadata = {
  title: "Ro'yxatdan o'tish - UstozPro",
}

export default async function SignUpPage() {
  const user = await getCurrentUser()
  if (user?.id) redirect('/')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">UstozPro</h1>
            <p className="text-gray-600 mt-2">O&apos;qituvchilar uchun professional platforma</p>
          </div>
          <AuthForm mode="sign-up" />
        </div>
      </div>
    </main>
  )
}
