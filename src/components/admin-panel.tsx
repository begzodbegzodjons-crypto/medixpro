'use client'

import { useState } from 'react'
import { redeemAdminCode, redeemCoinPackage } from '@/lib/api'
import { Key, AlertCircle, CheckCircle, Coins, ExternalLink, Lock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const [adminCode, setAdminCode] = useState('')
  const [coinCode, setCoinCode] = useState('')
  const [loading, setLoading] = useState<'admin' | 'coin' | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const { data: session, update } = useSession()
  const router = useRouter()

  const isAdmin = (session?.user as any)?.isAdmin

  const showMessage = (type: 'success' | 'error', msg: string) => {
    setMessageType(type)
    setMessage(msg)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 5000)
  }

  const handleRedeemAdminCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminCode.trim()) return

    setLoading('admin')
    try {
      const result = await redeemAdminCode(adminCode)
      showMessage('success', `${result.type === 'admin' ? 'Admin' : "O'qituvchi"} kodini muvaffaqiyatli qo'llantirdingiz`)
      setAdminCode('')
      await update()
    } catch (error: any) {
      showMessage('error', error.message || 'Xato yuz berdi')
    } finally {
      setLoading(null)
    }
  }

  const handleRedeemCoinPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coinCode.trim()) return

    setLoading('coin')
    try {
      const result = await redeemCoinPackage(coinCode)
      showMessage('success', `${result.coins} COIN muvaffaqiyatli qo'shildi!`)
      setCoinCode('')
      await update()
    } catch (error: any) {
      showMessage('error', error.message || 'Xato yuz berdi')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Admin paneli</h2>
        <p className="text-gray-600 text-sm md:text-base">Admin funktsiyalari va COIN paketlari</p>
      </div>

      {/* Success/Error message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {messageType === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={messageType === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message}
          </p>
        </div>
      )}

      {/* Admin Code Redemption */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Admin kodini qo&apos;llantiring</h3>

        <form onSubmit={handleRedeemAdminCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin kodi
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Admin kodini kiriting..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
              <button
                type="submit"
                disabled={loading === 'admin' || !adminCode.trim()}
                className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
              >
                {loading === 'admin' ? '...' : "Qo'llash"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* COIN Package Redemption */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">COIN paket kodini qo&apos;llantiring</h3>

        <form onSubmit={handleRedeemCoinPackage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              COIN paket kodi
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coinCode}
                onChange={(e) => setCoinCode(e.target.value)}
                placeholder="COIN-XXXX formatidagi kod..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
              />
              <button
                type="submit"
                disabled={loading === 'coin' || !coinCode.trim()}
                className="px-4 md:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
              >
                {loading === 'coin' ? '...' : 'COIN olish'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Admin Access to Full Panel */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 md:p-6 mb-6 text-white shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <Lock className="w-6 h-6 text-blue-200 flex-shrink-0" />
            <div>
              <h3 className="text-base md:text-lg font-bold mb-2">To&apos;liq admin paneliga kirish</h3>
              <p className="text-blue-100 text-sm">
                Sizda admin huquqlari bor. To&apos;liq boshqaruv paneliga kirib, foydalanuvchilar, testlar,
                materiallar, reklamalar va boshqalarni boshqarishingiz mumkin.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin-access?adminkod=access')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            To&apos;liq admin paneliga kirish
          </button>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-blue-50 rounded-lg p-4 md:p-6 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <Key className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 mb-2 text-sm md:text-base">Admin funktsiyalari</h4>
              <ul className="text-xs md:text-sm text-blue-800 space-y-1">
                <li>• Testlar yaratish va o&apos;zgartirish</li>
                <li>• Materiallarni yuklash</li>
                <li>• Foydalanuvchilar ma&apos;lumotlarini boshqarish</li>
                <li>• Admin kodlarini yaratish</li>
                <li>• Reklamalarni boshqarish</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 md:p-6 border-2 border-green-200">
          <div className="flex items-start gap-3">
            <Coins className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-green-900 mb-2 text-sm md:text-base">COIN paketlari</h4>
              <p className="text-xs md:text-sm text-green-800">
                COIN paket kodlari orqali balansingizni to&apos;ldiring. Har bir kod faqat bir marta
                ishlatiladi. Testdan o&apos;tib 50 COIN ham olishingiz mumkin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
