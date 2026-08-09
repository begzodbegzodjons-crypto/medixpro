'use client'

import { useEffect, useState } from 'react'
import { getLessonMaterials, getLessonMaterialById, getSubjects } from '@/lib/api'
import { ArrowLeft, Search, X, ExternalLink, FileText, Video, Presentation, FileCheck } from 'lucide-react'

const TYPE_LABELS: Record<string, { label: string; icon: any }> = {
  presentation: { label: 'Prezentatsiya', icon: Presentation },
  worksheet: { label: 'Ish varaqi', icon: FileCheck },
  test: { label: 'Test', icon: FileCheck },
  video: { label: 'Video', icon: Video },
  document: { label: 'Hujjat', icon: FileText },
}

export default function LessonMaterials() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [viewingItem, setViewingItem] = useState<any | null>(null)

  useEffect(() => { getSubjects().then(setSubjects).catch(console.error).finally(() => setLoading(false)) }, [])
  useEffect(() => { loadItems(1) }, [selectedSubject, selectedType, selectedClass, search])

  const loadItems = async (pageNum: number) => {
    setLoadingItems(true)
    try {
      const data = await getLessonMaterials({ subjectId: selectedSubject || undefined, type: selectedType || undefined, classLevel: selectedClass || undefined, search: search || undefined, page: pageNum })
      setMaterials(data.items || []); setTotalPages(data.pagination?.totalPages || 1); setTotal(data.pagination?.total || 0); setPage(pageNum)
    } catch (e) { console.error(e) } finally { setLoadingItems(false) }
  }

  const handleView = async (id: string) => { try { setViewingItem(await getLessonMaterialById(id)) } catch (e) { console.error(e) } }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>

  if (viewingItem) {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setViewingItem(null)} className="mb-4 flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900"><ArrowLeft className="w-4 h-4" /> Ro'yhatga qayt</button>
        <div className="card p-6 md:p-8">
          {viewingItem.subject?.icon && <span className="text-2xl">{viewingItem.subject.icon}</span>}
          <h1 className="text-xl font-semibold text-neutral-900 mt-2">{viewingItem.title}</h1>
          {viewingItem.description && <p className="text-neutral-500 mt-2 text-sm">{viewingItem.description}</p>}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-400">
            {viewingItem.subject && <span>{viewingItem.subject.name}</span>}
            {viewingItem.topic && <span>• {viewingItem.topic.name}</span>}
            {viewingItem.classLevel && <span>• {viewingItem.classLevel}-sinf</span>}
            <span>• {TYPE_LABELS[viewingItem.type]?.label || viewingItem.type}</span>
          </div>
          {viewingItem.fileUrls && Array.isArray(viewingItem.fileUrls) && viewingItem.fileUrls.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="font-medium text-neutral-900 text-sm mb-2">Fayllar</h3>
              {viewingItem.fileUrls.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors group">
                  <FileText className="w-4 h-4 text-neutral-500" />
                  <span className="flex-1 text-sm text-neutral-900 group-hover:text-neutral-700">Fayl {i + 1}</span>
                  <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6"><h2 className="text-lg font-medium text-neutral-900 mb-1">Dars ishlanmalari</h2><p className="text-sm text-neutral-500">Prezentatsiyalar, ish varaqalari, videolar (bepul)</p></div>
      <div className="card p-3 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => { setSelectedSubject(null); setSelectedType(''); setSelectedClass(''); setSearch('') }} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!selectedSubject ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>Barcha fanlar</button>
          {subjects.map((s) => (<button key={s.id} onClick={() => setSelectedSubject(s.id)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedSubject === s.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>{s.icon && <span className="mr-1">{s.icon}</span>}{s.name}</button>))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="input !h-8 !w-auto text-xs"><option value="">Barcha turlar</option><option value="presentation">Prezentatsiya</option><option value="worksheet">Ish varaqi</option><option value="test">Test</option><option value="video">Video</option><option value="document">Hujjat</option></select>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="input !h-8 !w-auto text-xs"><option value="">Barcha sinflar</option>{[5, 6, 7, 8, 9, 10, 11].map((c) => <option key={c} value={String(c)}>{c}-sinf</option>)}</select>
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="input pl-9 !h-8 text-xs" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded"><X className="w-3 h-3" /></button>}
          </div>
        </div>
      </div>
      {loadingItems ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div> : materials.length === 0 ? <div className="card p-12 text-center"><p className="text-neutral-500">Materiallar topilmadi</p></div> : (
        <>
          <p className="text-sm text-neutral-500 mb-3">{total} ta material</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {materials.map((m) => { const ti = TYPE_LABELS[m.type] || { label: m.type, icon: FileText }; return (
              <button key={m.id} onClick={() => handleView(m.id)} className="card p-4 text-left hover:border-neutral-400 transition-colors group">
                <div className="flex items-start justify-between mb-2"><ti.icon className="w-5 h-5 text-neutral-500" /><span className="badge bg-neutral-100 text-neutral-600 text-xs">{ti.label}</span></div>
                <h3 className="font-medium text-neutral-900 text-sm mb-1 group-hover:text-neutral-700">{m.title}</h3>
                {m.description && <p className="text-xs text-neutral-500 line-clamp-2">{m.description}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-400">
                  {m.subject && <span className="badge bg-neutral-100 text-neutral-600">{m.subject.name}</span>}
                  {m.classLevel && <span className="badge bg-neutral-100 text-neutral-600">{m.classLevel}-sinf</span>}
                </div>
              </button>
            )})}
          </div>
          {totalPages > 1 && <div className="flex justify-center items-center gap-2 mt-6"><button onClick={() => loadItems(page - 1)} disabled={page === 1} className="btn-secondary !h-8 !px-3 text-xs">Oldingi</button><span className="text-sm text-neutral-500">{page} / {totalPages}</span><button onClick={() => loadItems(page + 1)} disabled={page === totalPages} className="btn-secondary !h-8 !px-3 text-xs">Keyingi</button></div>}
        </>
      )}
    </div>
  )
}
