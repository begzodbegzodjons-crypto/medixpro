import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'
import AuthForm from '@/components/auth-form'

export const metadata = { title: 'Kirish — UstozPro' }

export default async function SignInPage() {
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
            Dars ishlanmalari, testlar va materiallar bir joyda
          </h2>
          <p className="text-white/70 text-[15px] leading-relaxed">
            11 fan bo'yicha dars rejalari, ish varaqalari, prezentatsiyalar, 
            testlar va o'quv materiallari. Hammasi bepul va onlayn.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div>
              <div className="text-2xl font-semibold">11</div>
              <div className="text-white/50 text-xs mt-0.5">Fanlar</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">50+</div>
              <div className="text-white/50 text-xs mt-0.5">Mavzular</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">8+</div>
              <div className="text-white/50 text-xs mt-0.5">Dars rejalari</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">8+</div>
              <div className="text-white/50 text-xs mt-0.5">Ish varaqalari</div>
            </div>
          </div>
        </div>
        <p className="text-white/40 text-xs">© 2026 UstozPro</p>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <AuthForm mode="sign-in" />
      </div>
    </div>
  )
}
