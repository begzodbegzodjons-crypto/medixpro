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
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">UstozPro</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {isSignUp ? "Ro'yxatdan o'tish" : 'Hisobingizga kirish'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="label" htmlFor="name">F.I.O</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input" placeholder="Ism familiyangiz" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" placeholder="email@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="password">Parol</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input" placeholder="••••••••" />
        </div>

        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
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
