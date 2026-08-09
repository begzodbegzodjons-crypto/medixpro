'use client'

import { useEffect, useState } from 'react'

export default function Stats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/stats').then(r => r.json()).then(setStats).catch(console.error).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>

  const cards = [
    { title: 'Jami testlar', value: stats?.totalTests || 0 },
    { title: "O'tgan", value: stats?.passedTests || 0 },
    { title: 'Yutqazgan', value: stats?.failedTests || 0 },
    { title: "O'rtacha ball", value: `${stats?.averageScore || 0}%` },
  ]

  return (
    <div>
      <div className="mb-6"><h2 className="text-lg font-medium text-neutral-900 mb-1">Statistika</h2><p className="text-sm text-neutral-500">O'qish jarayoningiz</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((card, i) => (
          <div key={i} className="card p-5">
            <p className="text-xs text-neutral-500 mb-1">{card.title}</p>
            <p className="text-2xl font-semibold text-neutral-900">{card.value}</p>
          </div>
        ))}
      </div>
      {stats?.recentResults && stats.recentResults.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-neutral-200"><h3 className="font-medium text-neutral-900">So'nggi natijalar</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50"><tr><th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Test</th><th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 hidden md:table-cell">Fan</th><th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Ball</th><th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Natija</th></tr></thead>
              <tbody className="divide-y divide-neutral-100">
                {stats.recentResults.map((r: any) => (
                  <tr key={r.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-neutral-900">{r.test?.title}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">{r.test?.subject?.name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">{Number(r.score).toFixed(1)}%</td>
                    <td className="px-4 py-3"><span className={`badge ${r.passed ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}`}>{r.passed ? "O'tdi" : 'Yutqazdi'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
