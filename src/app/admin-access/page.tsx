'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, AlertCircle } from 'lucide-react'

export default function AdminAccessPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const adminKod = searchParams.get('adminkod')

  // Only show this page if ?adminkod query parameter is present
  if (!adminKod) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md">
          <p className="text-gray-600 text-center">Kirish imkoni yo&apos;q</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Parol noto'g'ri")
        setLoading(false)
        return
      }

      // Store admin session token in localStorage
      localStorage.setItem('adminToken', data.token)
      router.push('/admin')
    } catch (err) {
      setError('Xato yuz berdi')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 rounded-full p-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Admin Paneli</h1>
        <p className="text-gray-600 text-center mb-6">Kirish parolini kiriting</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parol
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolni kiriting..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Tekshirilmoqda...' : 'Kirish'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Standart parol: <code className="bg-gray-100 px-1 py-0.5 rounded">Balandtoglar1</code>
        </p>
      </div>
    </div>
  )
}
