import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'
import AuthForm from '@/components/auth-form'

export const metadata = { title: 'Kirish — UstozPro' }

export default async function SignInPage() {
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
            Dars ishlanmalari va testlar bir joyda
          </h2>
          <p className="text-white/60 text-[12px] leading-relaxed">
            11 fan, dars rejalari, ish varaqalari, prezentatsiyalar va testlar. Bepul.
          </p>
          <div className="grid grid-cols-4 gap-2 mt-6">
            <div><div className="text-lg font-semibold">11</div><div className="text-white/40 text-[10px]">Fan</div></div>
            <div><div className="text-lg font-semibold">50+</div><div className="text-white/40 text-[10px]">Mavzu</div></div>
            <div><div className="text-lg font-semibold">8+</div><div className="text-white/40 text-[10px]">Reja</div></div>
            <div><div className="text-lg font-semibold">8+</div><div className="text-white/40 text-[10px]">Ish varaq</div></div>
          </div>
        </div>
        <p className="text-white/30 text-[10px]">© 2026 UstozPro</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-5 bg-white">
        <AuthForm mode="sign-in" />
      </div>
    </div>
  )
}
