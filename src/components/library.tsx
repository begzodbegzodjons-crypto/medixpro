'use client'

import { useEffect, useState } from 'react'
import { getLibrary } from '@/app/actions'
import { Download, PlayCircle, FileText } from 'lucide-react'

export default function Library() {
  const [libraryItems, setLibraryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const items = await getLibrary()
        setLibraryItems(items)
      } catch (error) {
        console.error('Failed to load library', error)
      } finally {
        setLoading(false)
      }
    }

    loadLibrary()
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mening kutubhonam</h2>
        <p className="text-gray-600">Sotin olingan darsliklar va videolarga qo'l bering</p>
      </div>

      {libraryItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900">{item.material?.title}</h3>
                {item.material?.type === 'video' ? (
                  <PlayCircle className="w-6 h-6 text-blue-600" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600" />
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4">{item.material?.description}</p>

              <div className="space-y-2 mb-4 text-xs text-gray-500">
                <p>Sotin olindi: {new Date(item.purchasedAt).toLocaleDateString('uz')}</p>
              </div>

              {item.material?.fileUrl && (
                <a
                  href={item.material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Qo'l bering
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">Siz hali hech narsani sotin olmadi</p>
          <p className="text-gray-500 text-sm">Marketplaysdan darslik va videolarni ko'ring</p>
        </div>
      )}
    </div>
  )
}
