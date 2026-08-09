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
    { id: 'home', label: 'Bosh sahifa' },
    { id: 'tests', label: 'Testlar' },
    { id: 'lesson-plans', label: 'Dars rejalari' },
    { id: 'lesson-materials', label: 'Dars ishlanmalari' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'library', label: 'Kutubxona' },
    { id: 'favorites', label: 'Sevimlilar' },
    { id: 'stats', label: 'Statistika' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('home')} className="text-base font-semibold text-neutral-900 tracking-tight whitespace-nowrap">
              UstozPro
            </button>
            <div className="hidden lg:flex items-center gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSearch && (
              <button onClick={onSearch} className="p-2 hover:bg-neutral-100 rounded-md transition-colors" aria-label="Qidirish">
                <Search className="w-4 h-4 text-neutral-600" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100">
              <Coins className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-[13px] font-medium text-neutral-700">{Math.floor(coinBalance)}</span>
            </div>
            <button onClick={handleLogout} className="hidden sm:flex p-2 hover:bg-neutral-100 rounded-md transition-colors">
              <LogOut className="w-4 h-4 text-neutral-600" />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 hover:bg-neutral-100 rounded-md transition-colors" aria-label="Menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-3 space-y-0.5 border-t border-neutral-100 pt-2">
            <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1 rounded-md bg-neutral-100 sm:hidden">
              <Coins className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-[13px] font-medium text-neutral-700">{Math.floor(coinBalance)} COIN</span>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMenuOpen(false) }}
                className={`w-full text-left px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${activeTab === tab.id ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'}`}
              >
                {tab.label}
              </button>
            ))}
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-[13px] font-medium text-red-600 hover:bg-red-50">Chiqish</button>
          </div>
        )}
      </div>
    </nav>
  )
}
