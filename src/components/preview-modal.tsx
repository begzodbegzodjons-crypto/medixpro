'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { X, Shield, Download } from 'lucide-react'

interface PreviewModalProps {
  url: string
  type: 'pdf' | 'video' | 'html' | 'image'
  title: string
  onClose: () => void
  canDownload?: boolean
  onDownload?: () => void
}

export default function PreviewModal({ url, type, title, onClose, canDownload, onDownload }: PreviewModalProps) {
  const { data: session } = useSession()
  const [showWarning, setShowWarning] = useState(false)
  const userEmail = session?.user?.email || 'Noma\'lum foydalanuvchi'
  const userName = session?.user?.name || ''
  const watermarkText = `${userName} (${userEmail}) - UstozPro himoyalangan material`

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault()
        setShowWarning(true)
        navigator.clipboard?.writeText('').catch(() => {})
        setTimeout(() => setShowWarning(false), 3000)
        return false
      }
      if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false }
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) { e.preventDefault(); return false }
      if (e.ctrlKey && e.key.toUpperCase() === 'U') { e.preventDefault(); return false }
      if (e.ctrlKey && e.key.toUpperCase() === 'S') { e.preventDefault(); return false }
      const target = e.target as HTMLElement
      if (e.ctrlKey && ['C', 'X'].includes(e.key.toUpperCase()) && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') { e.preventDefault(); return false }
    }
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); return false }
    const handleCopy = (e: ClipboardEvent) => { e.preventDefault(); e.clipboardData?.setData('text/plain', 'Materiallar himoyalangan'); return false }
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') { e.preventDefault(); return false }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('selectstart', handleSelectStart)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('selectstart', handleSelectStart)
    }
  }, [])

  const watermarkItems = Array.from({ length: 30 }, (_, i) => i)

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      <div className="bg-gray-900 text-white p-3 md:p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          <div>
            <h3 className="font-bold text-sm md:text-base">{title}</h3>
            <p className="text-xs text-gray-400">Himoyalangan ko'rinish - skrinchot olish taqiqlangan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canDownload && onDownload && (
            <button onClick={onDownload} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /><span className="hidden sm:inline">Yuklab olish</span>
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="Yopish"><X className="w-5 h-5" /></button>
        </div>
      </div>
      {showWarning && <div className="bg-red-600 text-white p-3 text-center text-sm font-medium flex-shrink-0">⚠️ Skrinchot olish taqiqlangan! Bu amal qayd etildi.</div>}
      <div className="flex-1 relative overflow-hidden bg-white">
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-wrap items-center justify-around opacity-10" style={{ pointerEvents: 'none' }}>
          {watermarkItems.map((i) => (
            <div key={i} className="text-gray-700 text-xs md:text-sm font-bold whitespace-nowrap transform -rotate-30 px-4 py-2" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>{watermarkText}</div>
          ))}
        </div>
        <div className="relative z-0 w-full h-full" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
          {(type === 'pdf' || type === 'html') && <iframe src={url} className="w-full h-full border-none" title={title} sandbox="allow-scripts allow-same-origin allow-forms" />}
          {type === 'video' && <video src={url} className="w-full h-full" controls controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} />}
          {type === 'image' && <img src={url} alt={title} className="w-full h-full object-contain" onContextMenu={(e) => e.preventDefault()} draggable={false} />}
        </div>
      </div>
      <div className="bg-gray-900 text-gray-400 p-2 text-center text-xs flex-shrink-0">Foydalanuvchi: <span className="text-white font-medium">{userEmail}</span> • Material himoyalangan • {new Date().toLocaleString('uz')}</div>
    </div>
  )
}
