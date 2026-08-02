'use client'

import { useEffect, useState } from 'react'
import { getStats, getTestResults } from '@/app/actions'
import { TrendingUp, CheckCircle, XCircle, Target } from 'lucide-react'

export default function Stats() {
  const [stats, setStats] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getStats()
        const resultsData = await getTestResults()
        setStats(statsData)
        setResults(resultsData)
      } catch (error) {
        console.error('Failed to load stats', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Statistika</h2>
        <p className="text-gray-600">O'zingizning o'qish jarayonini ko'ring</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Jami testlar</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalTests || 0}</p>
            </div>
            <Target className="w-12 h-12 text-blue-600 opacity-10" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">O'tkazilgan testlar</p>
              <p className="text-3xl font-bold text-green-600">{stats?.passedTests || 0}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-10" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Mudda tugagan testlar</p>
              <p className="text-3xl font-bold text-red-600">{stats?.failedTests || 0}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-600 opacity-10" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">O'rtacha o'qish</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.averageScore}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 opacity-10" />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">So'nggi test natijalari</h3>
        </div>

        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Vaqti</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Ball</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Natija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.slice(0, 10).map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(result.createdAt).toLocaleDateString('uz')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {parseFloat(result.score || '0').toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          result.passed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {result.passed ? "O'tkazildi" : "Mudda tugadi"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-600">Siz hali hech narsani sotin olmadi</p>
          </div>
        )}
      </div>
    </div>
  )
}
