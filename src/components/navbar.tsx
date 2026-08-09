'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Menu, X, LogOut, Coins, Search } from 'lucide-react'

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: any) => void
  isAdmin: boolean
  onSearch?: () => void
}

export default function Navbar({ activeTab, setActiveTab, isAdmin, onSearch }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()
  const coinBalance = (session?.user as any)?.coinBalance ?? 0

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ redirect: false })
    window.location.href = '/sign-in'
  }

  const tabs = [
    { id: 'home', label: 'Bosh' },
    { id: 'tests', label: 'Testlar' },
    { id: 'lesson-plans', label: 'Rejalar' },
    { id: 'lesson-materials', label: 'Ishlanma' },
    { id: 'marketplace', label: 'Market' },
    { id: 'library', label: 'Kutubxona' },
    { id: 'favorites', label: 'Sevimli' },
    { id: 'stats', label: 'Statistika' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-2xl mx-auto px-3">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('home')} className="text-sm font-semibold text-neutral-900 tracking-tight whitespace-nowrap">
              UstozPro
            </button>
            <div className="hidden lg:flex items-center gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 py-1 rounded text-[12px] font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onSearch && (
              <button onClick={onSearch} className="p-1.5 hover:bg-neutral-100 rounded transition-colors" aria-label="Qidirish">
                <Search className="w-3.5 h-3.5 text-neutral-500" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100">
              <Coins className="w-3 h-3 text-neutral-400" />
              <span className="text-[11px] font-medium text-neutral-600">{Math.floor(coinBalance)}</span>
            </div>
            <button onClick={handleLogout} className="hidden sm:flex p-1.5 hover:bg-neutral-100 rounded transition-colors">
              <LogOut className="w-3.5 h-3.5 text-neutral-500" />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-1.5 hover:bg-neutral-100 rounded transition-colors" aria-label="Menu">
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-2 space-y-0.5 border-t border-neutral-100 pt-1.5">
            <div className="flex items-center gap-1 px-2 py-1 mb-1 rounded bg-neutral-100 sm:hidden">
              <Coins className="w-3 h-3 text-neutral-400" />
              <span className="text-[11px] font-medium text-neutral-600">{Math.floor(coinBalance)} COIN</span>
            </div>
            <div className="grid grid-cols-2 gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMenuOpen(false) }}
                  className={`text-left px-2 py-1.5 rounded text-[12px] font-medium transition-colors ${activeTab === tab.id ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-50'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button onClick={handleLogout} className="w-full text-left px-2 py-1.5 rounded text-[12px] font-medium text-red-600 hover:bg-red-50 mt-1">Chiqish</button>
          </div>
        )}
      </div>
    </nav>
  )
}
