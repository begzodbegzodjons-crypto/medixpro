'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, LogOut, Coins } from 'lucide-react'

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: any) => void
  isAdmin: boolean
}

export default function Navbar({ activeTab, setActiveTab, isAdmin }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const coinBalance = (session?.user as any)?.coinBalance ?? 0

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/sign-in')
  }

  const tabs = [
    { id: 'home', label: 'Bosh sahifa' },
    { id: 'tests', label: 'Testlar' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'library', label: 'Kutubxona' },
    { id: 'stats', label: 'Statistika' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className="bg-white shadow-md border-b border-blue-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-600">UstozPro</h1>

            {/* Desktop menu */}
            <div className="hidden md:flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center bg-green-100 px-4 py-2 rounded-lg">
              <Coins className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-700">
                {Math.floor(coinBalance)} COIN
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
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
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Chiqish
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
