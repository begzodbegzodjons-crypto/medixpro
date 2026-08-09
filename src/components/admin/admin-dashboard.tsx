'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Users, BookOpen, Coins, ShoppingCart, FileText } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalSubjects: 0, totalTests: 0, totalMaterials: 0, activeCoinPackages: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const response = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
        if (response.ok) setStats(await response.json())
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  const statCards = [
    { title: 'Foydalanuvchilar', value: stats.totalUsers, icon: Users },
    { title: 'Fanlar', value: stats.totalSubjects, icon: BookOpen },
    { title: 'Testlar', value: stats.totalTests, icon: FileText },
    { title: 'Materiallar', value: stats.totalMaterials, icon: ShoppingCart },
    { title: 'COIN paketlar', value: stats.activeCoinPackages, icon: Coins },
  ]

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>

  return (
    <div>
      <div className="mb-6"><h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1><p className="text-sm text-neutral-500 mt-1">Umumiy statistika</p></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className="card p-5">
            <card.icon className="w-5 h-5 text-neutral-400 mb-2" />
            <p className="text-xs text-neutral-500 mb-0.5">{card.title}</p>
            <p className="text-2xl font-semibold text-neutral-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
