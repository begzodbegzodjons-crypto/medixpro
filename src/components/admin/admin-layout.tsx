'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut, BarChart3, BookOpen, FileText, Users, Coins, ImageIcon, Settings } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/admin' },
    { id: 'subjects', label: 'Fanlar', icon: BookOpen, href: '/admin/subjects' },
    { id: 'tests', label: 'Testlar', icon: FileText, href: '/admin/tests' },
    { id: 'marketplace', label: 'Marketplace', icon: BookOpen, href: '/admin/marketplace' },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users, href: '/admin/users' },
    { id: 'coins', label: 'COIN Tizimi', icon: Coins, href: '/admin/coins' },
    { id: 'ads', label: 'Reklamalar', icon: ImageIcon, href: '/admin/advertisements' },
    { id: 'settings', label: 'Sozlamalar', icon: Settings, href: '/admin/settings' },
  ]

  const handleLogout = () => { localStorage.removeItem('adminToken'); router.push('/') }

  return (
    <div className="flex h-screen bg-white">
      <div className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-neutral-900 text-white transition-all duration-200 flex flex-col`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen && <span className="text-sm font-semibold">Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-white/10 rounded"><Menu className="w-4 h-4" /></button>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {menuItems.map((item) => (
            <a key={item.id} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>
        <div className="p-2 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full">
            <LogOut className="w-4 h-4 flex-shrink-0" />{sidebarOpen && <span>Chiqish</span>}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto"><div className="p-6 md:p-8">{children}</div></div>
    </div>
  )
}
