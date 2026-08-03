'use client'

import { useEffect, useState } from 'react'
import { getFavorites } from '@/lib/api'
import { Heart, FileText, PlayCircle, Download, BookOpen } from 'lucide-react'

export default function Favorites() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFavorites()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
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
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Sevimlilar ❤️</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Sevimli materiallaringiz ({items.length} ta)
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map((fav) => {
            const m = fav.material
            if (!m) return null
            return (
              <div key={fav.id} className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 flex-1 text-sm md:text-base">{m.title}</h3>
                  <Heart className="w-4 h-4 text-red-500 fill-red-500 flex-shrink-0" />
                </div>
                {m.description && (
                  <p className="text-gray-600 text-xs md:text-sm mb-3 flex-1">{m.description}</p>
                )}
                {m.subject && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <BookOpen className="w-3 h-3" />
                    {m.subject.name}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${
                    m.isFree || m.price === 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {m.isFree || m.price === 0 ? 'Bepul' : `${m.price} COIN`}
                  </span>
                  {m.fileUrl && (
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Ko&apos;rish
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 md:p-12 text-center">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Sevimlilar ro&apos;yxati bo&apos;sh</p>
          <p className="text-gray-500 text-sm">Marketplace&apos;da materiallarga ❤️ bosing</p>
        </div>
      )}
    </div>
  )
}
