'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, LogOut, Coins, Search, BookOpen, FileText, Heart, BarChart3, BookMarked, Home, Award } from 'lucide-react'

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: any) => void
  isAdmin: boolean
  onSearch?: () => void
}

export default function Navbar({ activeTab, setActiveTab, isAdmin, onSearch }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const coinBalance = (session?.user as any)?.coinBalance ?? 0

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/sign-in')
  }

  const tabs = [
    { id: 'home', label: 'Bosh sahifa', icon: Home },
    { id: 'tests', label: 'Testlar', icon: Award },
    { id: 'lesson-plans', label: 'Dars rejalari', icon: BookOpen },
    { id: 'lesson-materials', label: 'Dars ishlanmalari', icon: FileText },
    { id: 'marketplace', label: 'Marketplace', icon: BookMarked },
    { id: 'library', label: 'Kutubxona', icon: BookOpen },
    { id: 'favorites', label: 'Sevimlilar', icon: Heart },
    { id: 'stats', label: 'Statistika', icon: BarChart3 },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: BarChart3 }] : []),
  ]

  return (
    <nav className="bg-white shadow-md border-b border-blue-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3 gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-blue-600 whitespace-nowrap">UstozPro</h1>

            {/* Desktop menu */}
            <div className="hidden lg:flex items-center gap-1 ml-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={tab.label}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3">
            {onSearch && (
              <button
                onClick={onSearch}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Qidirish"
                title="Qidirish"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            )}

            <div className="hidden sm:flex items-center bg-green-100 px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
              <Coins className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-700 text-sm md:text-base">
                {Math.floor(coinBalance)} COIN
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 md:px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-medium">Chiqish</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden pb-4 space-y-1">
            <div className="flex items-center bg-green-100 px-4 py-2 rounded-lg mb-2 sm:hidden">
              <Coins className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-700">
                {Math.floor(coinBalance)} COIN
              </span>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 text-left px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Chiqish
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
