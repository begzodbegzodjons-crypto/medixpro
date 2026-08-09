'use client'

import { useEffect, useState } from 'react'
import { Download, PlayCircle, FileText, BookOpen, Eye, Heart } from 'lucide-react'
import { toggleFavorite } from '@/lib/api'
import PreviewModal from './preview-modal'

interface LibraryItem { id: string; material: { id: string; title: string; description?: string; fileUrl: string; type: string; price: number; subject?: { name: string } }; purchasedAt: string }

export default function Library() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null)

  useEffect(() => { fetch('/api/library').then(r => r.ok ? r.json() : []).then(setItems).catch(console.error).finally(() => setLoading(false)) }, [])

  const handleToggleFavorite = async (materialId: string) => { try { await toggleFavorite(materialId) } catch (e) { console.error(e) } }
  const getPreviewType = (type: string): 'pdf' | 'video' => type === 'video' ? 'video' : 'pdf'

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>

  return (
    <div>
      <div className="mb-6"><h2 className="text-xl font-medium text-neutral-900 mb-1">Mening kutubxonam</h2><p className="text-sm text-neutral-500">{items.length} ta material</p></div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border border-neutral-200 rounded-lg p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-neutral-900 text-sm flex-1">{item.material.title}</h3>
                {item.material.type === 'video' ? <PlayCircle className="w-5 h-5 text-neutral-400 flex-shrink-0" /> : <FileText className="w-5 h-5 text-neutral-400 flex-shrink-0" />}
              </div>
              {item.material.description && <p className="text-sm text-neutral-500 mb-3 flex-1 line-clamp-2">{item.material.description}</p>}
              {item.material.subject && <div className="flex items-center gap-1 text-xs text-neutral-400 mb-3"><BookOpen className="w-3 h-3" />{item.material.subject.name}</div>}
              <div className="text-xs text-neutral-400 mb-3">{new Date(item.purchasedAt).toLocaleDateString('uz')}</div>
              <div className="flex gap-2">
                <button onClick={() => setPreviewItem(item)} className="flex-1 px-3 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800"><Eye className="w-4 h-4 inline mr-1" /> Ko'rish</button>
                <a href={`/api/materials/${item.material.id}/download`} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50" title="Yuklab olish"><Download className="w-4 h-4" /></a>
                <button onClick={() => handleToggleFavorite(item.material.id)} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50" title="Sevimlilarga"><Heart className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg p-12 text-center">
          <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 mb-1">Siz hali hech narsa sotib olmagansiz</p>
          <p className="text-neutral-400 text-sm">Marketplace'dan materiallar sotib oling</p>
        </div>
      )}
      {previewItem && <PreviewModal url={`/api/materials/${previewItem.material.id}/preview`} type={getPreviewType(previewItem.material.type)} title={previewItem.material.title} onClose={() => setPreviewItem(null)} canDownload={true} onDownload={() => window.open(`/api/materials/${previewItem.material.id}/download`, '_blank')} />}
    </div>
  )
}
