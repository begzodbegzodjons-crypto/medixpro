'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, ArrowLeft, Search, X, Eye } from 'lucide-react'
import PreviewModal from './preview-modal'

interface Subject { id: string; name: string; icon?: string }
interface Material { id: string; title: string; description?: string; fileUrl: string; type: string; price: number; isFree: boolean; createdAt: string; subject?: { id: string; name: string } }

export default function Marketplace() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [previewItem, setPreviewItem] = useState<Material | null>(null)

  useEffect(() => { fetch('/api/subjects').then(r => r.json()).then(setSubjects).catch(console.error).finally(() => setLoading(false)) }, [])
  useEffect(() => { if (selectedSubject) loadMaterials(1) }, [selectedSubject, search, filter])

  const loadMaterials = async (pageNum: number) => {
    if (!selectedSubject) return; setLoadingMaterials(true); setError(null)
    try {
      const params = new URLSearchParams({ subjectId: selectedSubject, page: String(pageNum), limit: '12' })
      if (search) params.set('search', search)
      if (filter === 'free') params.set('isFree', 'true')
      const res = await fetch(`/api/materials?${params}`)
      if (res.ok) { const data = await res.json(); setMaterials(data.items || []); setTotalPages(data.pagination?.totalPages || 1); setTotal(data.pagination?.total || 0); setPage(pageNum) }
    } catch (e) { console.error(e); setError('Materiallarni yuklashda xato') } finally { setLoadingMaterials(false) }
  }

  const handlePurchase = async (materialId: string) => {
    setPurchasing(materialId); setError(null)
    try {
      const res = await fetch('/api/materials/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ materialId }) })
      const data = await res.json(); if (!res.ok) setError(data.message || 'Xato'); else { await loadMaterials(page); window.location.reload() }
    } catch (e) { setError('Sotib olishda xato') } finally { setPurchasing(null) }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>

  return (
    <div>
      <div className="mb-6"><h2 className="text-lg font-medium text-neutral-900 mb-1">Marketplace</h2><p className="text-sm text-neutral-500">O'quv materiallari</p></div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      {!selectedSubject ? (
        <div>
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Fanni tanlang</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {subjects.map((subject) => (
              <button key={subject.id} onClick={() => setSelectedSubject(subject.id)} className="card p-4 text-left hover:border-neutral-400 transition-colors">
                {subject.icon && <div className="text-xl mb-2">{subject.icon}</div>}
                <h3 className="font-medium text-sm text-neutral-900">{subject.name}</h3>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <button onClick={() => { setSelectedSubject(null); setMaterials([]); setSearch(''); setFilter('all') }} className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Fanlarga qayt</button>
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="input pl-9" />
                {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded"><X className="w-3 h-3" /></button>}
              </div>
              <div className="flex gap-1">{(['all', 'free', 'paid'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>{f === 'all' ? 'Barchasi' : f === 'free' ? 'Bepul' : 'Pullik'}</button>
              ))}</div>
            </div>
          </div>
          {loadingMaterials ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div> : materials.length === 0 ? <div className="card p-12 text-center"><p className="text-neutral-500">Materiallar topilmadi</p></div> : (
            <>
              <p className="text-sm text-neutral-500 mb-3">{total} ta material</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {materials.map((material) => (
                  <div key={material.id} className="card p-4 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-neutral-900 text-sm flex-1">{material.title}</h3>
                      <span className="badge bg-neutral-100 text-neutral-600">{material.type.toUpperCase()}</span>
                    </div>
                    {material.description && <p className="text-xs text-neutral-500 mb-3 flex-1 line-clamp-2">{material.description}</p>}
                    {material.subject && <p className="text-xs text-neutral-400 mb-3">{material.subject.name}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-neutral-900">{material.isFree || material.price === 0 ? 'Bepul' : `${material.price} COIN`}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setPreviewItem(material)} className="btn-ghost !h-8 !px-2" title="Ko'rish"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handlePurchase(material.id)} disabled={purchasing === material.id} className="btn-primary !h-8 !px-3 text-xs"><ShoppingCart className="w-3 h-3" />{purchasing === material.id ? '...' : 'Olish'}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && <div className="flex justify-center items-center gap-2 mt-6"><button onClick={() => loadMaterials(page - 1)} disabled={page === 1} className="btn-secondary !h-8 !px-3 text-xs">Oldingi</button><span className="text-sm text-neutral-500">{page} / {totalPages}</span><button onClick={() => loadMaterials(page + 1)} disabled={page === totalPages} className="btn-secondary !h-8 !px-3 text-xs">Keyingi</button></div>}
            </>
          )}
        </div>
      )}
      {previewItem && <PreviewModal url={previewItem.fileUrl ? previewItem.fileUrl : `/api/materials/${previewItem.id}/preview`} type={previewItem.type === 'video' ? 'video' : 'pdf'} title={previewItem.title} onClose={() => setPreviewItem(null)} canDownload={false} />}
    </div>
  )
}
