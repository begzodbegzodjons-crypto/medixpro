'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, CheckCircle, XCircle, Target, Award } from 'lucide-react'

interface StatsData {
  totalTests: number
  passedTests: number
  failedTests: number
  averageScore: string | number
  recentResults: Array<{
    id: string
    score: number
    passed: boolean
    timeTaken: number | null
    createdAt: string
    test: {
      id: string
      title: string
      subject: { name: string }
    }
  }>
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to load stats', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const cards = [
    {
      title: 'Jami testlar',
      value: stats?.totalTests || 0,
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: "O'tgan testlar",
      value: stats?.passedTests || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Yutqazgan testlar',
      value: stats?.failedTests || 0,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: "O'rtacha ball",
      value: `${stats?.averageScore || 0}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Statistika</h2>
        <p className="text-gray-600 text-sm md:text-base">O&apos;qish jarayoningizni kuzating</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs md:text-sm font-medium">{card.title}</p>
                <p className={`text-xl md:text-3xl font-bold ${card.color} mt-1`}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.bg} rounded-lg p-2 md:p-3`}>
                <card.icon className={`w-5 h-5 md:w-6 md:h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h3 className="text-base md:text-lg font-bold text-gray-900">So&apos;nggi test natijalari</h3>
        </div>

        {stats?.recentResults && stats.recentResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700">Test</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 hidden md:table-cell">Fan</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700">Ball</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700">Natija</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 hidden sm:table-cell">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">
                      {result.test.title}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden md:table-cell">
                      {result.test.subject?.name || '-'}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-900">
                      {Number(result.score).toFixed(1)}%
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          result.passed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {result.passed ? 'O\'tdi' : 'Yutqazdi'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden sm:table-cell">
                      {new Date(result.createdAt).toLocaleDateString('uz')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 md:p-12 text-center">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Siz hali test topshirmagansiz</p>
            <p className="text-gray-500 text-sm mt-1">Testlar bo&apos;limidan birinchi testni boshlang</p>
          </div>
        )}
      </div>
    </div>
  )
}
