'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isSignUp) {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.message || 'Xato')
          setLoading(false)
          return
        }
      }
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) { setError(result.error); setLoading(false); return }
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Xato')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
          {isSignUp ? "Ro'yxatdan o'tish" : 'Tizimga kirish'}
        </h1>
        <p className="text-sm text-neutral-500 mt-1.5">
          {isSignUp ? 'Hisob yarating va foydalanishni boshlang' : 'Hisobingizga kiring'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5" htmlFor="name">F.I.O</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full h-11 px-3.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              placeholder="Ism familiyangiz" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5" htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full h-11 px-3.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            placeholder="email@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5" htmlFor="password">Parol</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            className="w-full h-11 px-3.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            placeholder="••••••••" />
        </div>

        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

        <button type="submit" disabled={loading}
          className="w-full h-11 rounded-lg bg-neutral-900 text-white text-[15px] font-medium transition-colors hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Bajarilmoqda...' : isSignUp ? "Ro'yxatdan o'tish" : 'Kirish'}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500 mt-6">
        {isSignUp ? 'Hisobingiz bormi? ' : "Hisobingiz yo'qmi? "}
        <Link href={isSignUp ? '/sign-in' : '/sign-up'} className="text-neutral-900 font-medium hover:underline">
          {isSignUp ? 'Kirish' : "Ro'yxatdan o'tish"}
        </Link>
      </p>
    </div>
  )
}
