import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'
import AuthForm from '@/components/auth-form'

export const metadata = { title: "Ro'yxatdan o'tish — UstozPro" }

export default async function SignUpPage() {
  const user = await getCurrentUser()
  if (user?.id) redirect('/')

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 text-white p-10 flex-col justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight">UstozPro</h1>
          <p className="text-white/50 text-[11px] mt-0.5">O'qituvchilar uchun</p>
        </div>
        <div className="max-w-sm">
          <h2 className="text-xl font-semibold leading-snug mb-3">
            Hamjamiyatga qo'shiling
          </h2>
          <p className="text-white/60 text-[12px] leading-relaxed">
            Dars ishlanmalari, testlar, reja va materiallarga bepul kirish.
          </p>
          <div className="space-y-1.5 mt-6">
            {['Dars rejalari (5-11 sinf)', 'Prezentatsiyalar', 'Testlar', 'Ish varaqalari'].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-white/50"></div>
                <span className="text-white/70 text-[11px]">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-[10px]">© 2026 UstozPro</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-5 bg-white">
        <AuthForm mode="sign-up" />
      </div>
    </div>
  )
}
