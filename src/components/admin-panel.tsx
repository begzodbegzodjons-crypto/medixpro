'use client'

import { useState } from 'react'
import { redeemAdminCode, redeemCoinPackage } from '@/lib/api'
import { AlertCircle, CheckCircle, Coins, ExternalLink, Lock } from 'lucide-react'
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

  const showMessage = (type: 'success' | 'error', msg: string) => { setMessageType(type); setMessage(msg); setTimeout(() => { setMessage(''); setMessageType('') }, 5000) }

  const handleRedeemAdminCode = async (e: React.FormEvent) => {
    e.preventDefault(); if (!adminCode.trim()) return; setLoading('admin')
    try { const result = await redeemAdminCode(adminCode); showMessage('success', `${result.type === 'admin' ? 'Admin' : "O'qituvchi"} kodi qabul qilindi`); setAdminCode(''); await update() }
    catch (error: any) { showMessage('error', error.message || 'Xato') } finally { setLoading(null) }
  }

  const handleRedeemCoinPackage = async (e: React.FormEvent) => {
    e.preventDefault(); if (!coinCode.trim()) return; setLoading('coin')
    try { const result = await redeemCoinPackage(coinCode); showMessage('success', `${result.coins} COIN qo'shildi!`); setCoinCode(''); await update() }
    catch (error: any) { showMessage('error', error.message || 'Xato') } finally { setLoading(null) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6"><h2 className="text-lg font-medium text-neutral-900 mb-1">Admin paneli</h2><p className="text-sm text-neutral-500">Admin funktsiyalari va COIN paketlari</p></div>
      {message && (<div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm ${messageType === 'success' ? 'bg-neutral-100 text-neutral-900' : 'bg-red-50 border border-red-200 text-red-700'}`}>{messageType === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}<p>{message}</p></div>)}
      <div className="card p-5 mb-4">
        <h3 className="font-medium text-neutral-900 mb-3 text-sm">Admin kodi</h3>
        <form onSubmit={handleRedeemAdminCode} className="flex gap-2">
          <input type="text" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Admin kodini kiriting..." className="input flex-1" />
          <button type="submit" disabled={loading === 'admin' || !adminCode.trim()} className="btn-primary">{loading === 'admin' ? '...' : "Qo'llash"}</button>
        </form>
      </div>
      <div className="card p-5 mb-4">
        <h3 className="font-medium text-neutral-900 mb-3 text-sm">COIN paket kodi</h3>
        <form onSubmit={handleRedeemCoinPackage} className="flex gap-2">
          <input type="text" value={coinCode} onChange={(e) => setCoinCode(e.target.value)} placeholder="COIN-XXXX formatidagi kod..." className="input flex-1" />
          <button type="submit" disabled={loading === 'coin' || !coinCode.trim()} className="btn-secondary">{loading === 'coin' ? '...' : 'COIN olish'}</button>
        </form>
      </div>
      {isAdmin && (
        <div className="card p-5 bg-neutral-900 border-neutral-900 text-white">
          <div className="flex items-start gap-3 mb-3"><Lock className="w-5 h-5 text-white/70 flex-shrink-0" /><div><h3 className="font-medium text-sm">To'liq admin paneliga kirish</h3><p className="text-xs text-white/60 mt-1">Foydalanuvchilar, testlar, materiallar, reklamalar va boshqalarni boshqaring</p></div></div>
          <button onClick={() => router.push('/admin-access?adminkod=access')} className="btn-secondary !bg-white !text-neutral-900 !border-white hover:!bg-neutral-100 text-sm">
            <ExternalLink className="w-3.5 h-3.5" /> Kirish
          </button>
        </div>
      )}
    </div>
  )
}
