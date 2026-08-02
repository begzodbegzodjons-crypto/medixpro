'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Menu,
  X,
  LogOut,
  BarChart3,
  BookOpen,
  ShoppingCart,
  Users,
  Coins,
  ImageIcon,
  Settings,
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/admin' },
    { id: 'subjects', label: 'Fanlar', icon: BookOpen, href: '/admin/subjects' },
    { id: 'tests', label: 'Testlar', icon: ShoppingCart, href: '/admin/tests' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart, href: '/admin/marketplace' },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users, href: '/admin/users' },
    { id: 'coins', label: 'COIN Tizimi', icon: Coins, href: '/admin/coins' },
    { id: 'ads', label: 'Reklamalar', icon: ImageIcon, href: '/admin/advertisements' },
    { id: 'settings', label: 'Sozlamalar', icon: Settings, href: '/admin/settings' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-blue-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Chiqish</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
