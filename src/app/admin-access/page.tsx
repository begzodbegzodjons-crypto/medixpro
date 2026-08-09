'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, AlertCircle } from 'lucide-react'

function AdminAccessContent() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const adminKod = searchParams.get('adminkod')

  if (!adminKod) {
    return <div className="min-h-screen flex items-center justify-center"><div className="card p-8 max-w-md text-center"><p className="text-neutral-500">Kirish imkoni yo'q</p></div></div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const response = await fetch('/api/admin/verify-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const data = await response.json()
      if (!response.ok) { setError(data.message || "Parol noto'g'ri"); setLoading(false); return }
      localStorage.setItem('adminToken', data.token); router.push('/admin')
    } catch (err) { setError('Xato'); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-900">
      <div className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto mb-4"><Lock className="w-5 h-5 text-neutral-700" /></div>
          <h1 className="text-lg font-semibold text-neutral-900">Admin paneli</h1>
          <p className="text-sm text-neutral-500 mt-1">Kirish parolini kiriting</p>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2"><AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-700">{error}</p></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parol" className="input" disabled={loading} autoFocus />
          <button type="submit" disabled={loading || !password} className="btn-primary w-full">{loading ? 'Tekshirilmoqda...' : 'Kirish'}</button>
        </form>
        <p className="text-xs text-neutral-400 text-center mt-4">Standart parol: <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700">Balandtoglar1</code></p>
      </div>
    </div>
  )
}

export default function AdminAccessPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>}><AdminAccessContent /></Suspense>
}
