import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'
import AuthForm from '@/components/auth-form'

export const metadata = { title: "Ro'yxatdan o'tish — UstozPro" }

export default async function SignUpPage() {
  const user = await getCurrentUser()
  if (user?.id) redirect('/')

  return (
    <div className="min-h-screen flex">
      {/* Left - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">UstozPro</h1>
          <p className="text-white/60 text-sm mt-1">O'qituvchilar uchun platforma</p>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight mb-4">
            O'qituvchilar hamjamiyatiga qo'shiling
          </h2>
          <p className="text-white/70 text-[15px] leading-relaxed">
            Ro'yxatdan o'ting va dars ishlanmalari, testlar, dars rejalari, 
            ko'rgazmali qurollar va boshqa o'quv materiallariga bepul kirishingiz mumkin.
          </p>
          <div className="space-y-3 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
              <span className="text-white/80 text-sm">Dars rejalari (5-11 sinflar)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
              <span className="text-white/80 text-sm">Prezentatsiyalar va ish varaqalari</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
              <span className="text-white/80 text-sm">Testlar va o'quv materiallari</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
              <span className="text-white/80 text-sm">To'garak hujjatlari va ko'rgazmalar</span>
            </div>
          </div>
        </div>
        <p className="text-white/40 text-xs">© 2026 UstozPro</p>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <AuthForm mode="sign-up" />
      </div>
    </div>
  )
}
