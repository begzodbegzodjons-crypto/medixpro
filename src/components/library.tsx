'use client'

import { useEffect, useState } from 'react'
import { Download, PlayCircle, FileText, BookOpen } from 'lucide-react'

interface LibraryItem {
  id: string
  material: {
    id: string
    title: string
    description?: string
    fileUrl: string
    type: string
    price: number
    subject?: { name: string }
  }
  purchasedAt: string
}

export default function Library() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/library')
        if (res.ok) {
          const data = await res.json()
          setItems(data)
        } else {
          setError('Kutubxonani yuklashda xato')
        }
      } catch (error) {
        console.error('Failed to load library', error)
        setError('Kutubxonani yuklashda xato')
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Mening kutubxonam</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Sotib olingan materiallarga kirishingiz mumkin ({items.length} ta)
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 flex-1 text-sm md:text-base">{item.material.title}</h3>
                {item.material.type === 'video' ? (
                  <PlayCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </div>

              {item.material.description && (
                <p className="text-gray-600 text-xs md:text-sm mb-3 flex-1">{item.material.description}</p>
              )}

              {item.material.subject && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <BookOpen className="w-3 h-3" />
                  {item.material.subject.name}
                </div>
              )}

              <div className="text-xs text-gray-500 mb-3">
                Sotib olindi: {new Date(item.purchasedAt).toLocaleDateString('uz')}
              </div>

              {item.material.fileUrl && (
                <a
                  href={item.material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Ko&apos;rish / Yuklab olish
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 md:p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Siz hali hech narsa sotib olmagansiz</p>
          <p className="text-gray-500 text-sm">Marketplace&apos;dan materiallar sotib oling</p>
        </div>
      )}
    </div>
  )
}
