'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAdminAuth } from '@/lib/use-admin-auth'
import { Settings, Save, MessageSquare, Lock, AlertCircle, CheckCircle, Key } from 'lucide-react'

export default function SettingsPage() {
  const { authenticated, loading } = useAdminAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordMessageType, setPasswordMessageType] = useState<'success' | 'error' | ''>('')

  const [telegramToken, setTelegramToken] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')
  const [telegramMessage, setTelegramMessage] = useState('')

  const [generatedCode, setGeneratedCode] = useState('')
  const [codeMessage, setCodeMessage] = useState('')

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage('')
    setPasswordMessageType('')

    try {
      const token = localStorage.getItem('adminToken')
      // Use verify-password endpoint to check the old password
      const verifyRes = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: oldPassword }),
      })

      if (!verifyRes.ok) {
        setPasswordMessageType('error')
        setPasswordMessage('Eski parol noto\'g\'ri')
        return
      }

      // Note: To change the admin password, you need to update the ADMIN_PASSWORD env variable.
      // In a real implementation, this would call an API that updates a Setting table row.
      setPasswordMessageType('success')
      setPasswordMessage('Admin parol o\'zgartirish uchun server ADMIN_PASSWORD muhit o\'zgaruvchisini yangilang.')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordMessageType('error')
      setPasswordMessage('Xato yuz berdi')
    }
  }

  const handleTelegramSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setTelegramMessage('')

    try {
      const token = localStorage.getItem('adminToken')
      // In a real implementation, save to Settings table
      // For now, just simulate success
      setTelegramMessage('Telegram bot sozlamalari saqlandi (demo rejim)')
    } catch (err) {
      setTelegramMessage('Xato yuz berdi')
    }
  }

  const handleGenerateAdminCode = async () => {
    setCodeMessage('')
    setGeneratedCode('')

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/generate-admin-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'admin' }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedCode(data.code)
        setCodeMessage('Admin kodi muvaffaqiyatli yaratildi!')
      } else {
        const err = await response.json()
        setCodeMessage(err.message || 'Xato yuz berdi')
      }
    } catch (err) {
      setCodeMessage('Xato yuz berdi')
    }
  }

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Sozlamalar</h1>
          <p className="text-gray-600 mt-2">Tizim sozlamalarini boshqaring</p>
        </div>

        <div className="space-y-6">
          {/* Admin Code Generation */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <Key className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Admin kodi yaratish</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Yangi admin uchun kod yarating va ularga bering. Ular &quot;Admin&quot; bo&apos;limida
                  shu kod orqali admin huquqlarini olishlari mumkin.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateAdminCode}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Yangi admin kodi yaratish
            </button>

            {generatedCode && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 mb-2">{codeMessage}</p>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-2 rounded border font-mono text-lg font-bold text-green-700">
                    {generatedCode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode)
                    }}
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Nusxa olish
                  </button>
                </div>
              </div>
            )}

            {codeMessage && !generatedCode && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{codeMessage}</p>
              </div>
            )}
          </div>

          {/* Admin Password */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Admin parolni o&apos;zgartirish</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Admin panelga kirish parolini almashtirish uchun eski parolni tasdiqlang
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eski parol
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Eski parolni kiriting"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yangi parol
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yangi parolni kiriting"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                  minLength={6}
                />
              </div>

              {passwordMessage && (
                <div className={`p-3 rounded-lg flex items-start gap-2 ${
                  passwordMessageType === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {passwordMessageType === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm ${passwordMessageType === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {passwordMessage}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Parolni o&apos;zgartirish
              </button>
            </form>
          </div>

          {/* Telegram Bot */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-green-100 rounded-lg p-3">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Telegram Bot</h2>
                <p className="text-gray-600 text-sm mt-1">
                  COIN aktivatsiya kodlarini Telegram orqali jo&apos;natish uchun bot sozlamalari
                </p>
              </div>
            </div>

            <form onSubmit={handleTelegramSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram Bot Token
                </label>
                <input
                  type="password"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="Bot token-ini kiriting"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Chat ID
                </label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="Chat ID-ni kiriting"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {telegramMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">{telegramMessage}</p>
                </div>
              )}

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Saqlash
              </button>
            </form>
          </div>

          {/* Other settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-orange-100 rounded-lg p-3">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Boshqa sozlamalar</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Saytning umumiy sozlamalari keyinchalik qo&apos;shiladi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
