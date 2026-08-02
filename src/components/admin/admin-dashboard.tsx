'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Users, BookOpen, Coins, ShoppingCart } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalSubjects: number
  totalTests: number
  totalMaterials: number
  activeCoinPackages: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSubjects: 0,
    totalTests: 0,
    totalMaterials: 0,
    activeCoinPackages: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const response = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Foydalanuvchilar',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Fanlar',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Testlar',
      value: stats.totalTests,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      title: 'Materiallar',
      value: stats.totalMaterials,
      icon: BarChart3,
      color: 'bg-orange-500',
    },
    {
      title: 'COIN Paketlari',
      value: stats.activeCoinPackages,
      icon: Coins,
      color: 'bg-yellow-500',
    },
  ]

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Admin panel-ga xush kelibsiz</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} rounded-lg p-3`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tez Harakatlari</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/subjects/new"
            className="p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-center"
          >
            <p className="font-semibold text-blue-600">Yangi Fan</p>
          </a>
          <a
            href="/admin/tests/new"
            className="p-4 border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors text-center"
          >
            <p className="font-semibold text-green-600">Yangi Test</p>
          </a>
          <a
            href="/admin/marketplace/new"
            className="p-4 border-2 border-purple-500 rounded-lg hover:bg-purple-50 transition-colors text-center"
          >
            <p className="font-semibold text-purple-600">Yangi Material</p>
          </a>
          <a
            href="/admin/coins/create-package"
            className="p-4 border-2 border-orange-500 rounded-lg hover:bg-orange-50 transition-colors text-center"
          >
            <p className="font-semibold text-orange-600">COIN Paketi</p>
          </a>
        </div>
      </div>
    </div>
  )
}
