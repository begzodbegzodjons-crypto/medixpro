'use client'

import { useEffect, useState } from 'react'
import { getFavorites } from '@/lib/api'
import { Heart, FileText, Download, BookOpen } from 'lucide-react'

export default function Favorites() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { getFavorites().then(setItems).catch(console.error).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>

  return (
    <div>
      <div className="mb-6"><h2 className="text-lg font-medium text-neutral-900 mb-1">Sevimlilar</h2><p className="text-sm text-neutral-500">{items.length} ta material</p></div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((fav) => { const m = fav.material; if (!m) return null; return (
            <div key={fav.id} className="card p-4 flex flex-col">
              <div className="flex items-start justify-between mb-2"><h3 className="font-medium text-neutral-900 text-sm flex-1">{m.title}</h3><Heart className="w-4 h-4 text-neutral-900 fill-neutral-900 flex-shrink-0" /></div>
              {m.description && <p className="text-xs text-neutral-500 mb-3 flex-1 line-clamp-2">{m.description}</p>}
              {m.subject && <div className="flex items-center gap-1 text-xs text-neutral-400 mb-3"><BookOpen className="w-3 h-3" />{m.subject.name}</div>}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-900">{m.isFree || m.price === 0 ? 'Bepul' : `${m.price} COIN`}</span>
                {m.fileUrl && <a href={`/api/materials/${m.id}/preview`} target="_blank" rel="noopener noreferrer" className="btn-ghost !h-8 !px-2.5" title="Ko'rish"><Download className="w-3.5 h-3.5" /></a>}
              </div>
            </div>
          )})}
        </div>
      ) : (
        <div className="card p-12 text-center"><Heart className="w-10 h-10 text-neutral-300 mx-auto mb-3" /><p className="text-neutral-500 mb-1">Sevimlilar ro'yxati bo'sh</p><p className="text-neutral-400 text-sm">Marketplace'da materiallarga ❤️ bosing</p></div>
      )}
    </div>
  )
}
