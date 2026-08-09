'use client'

import { useEffect, useState } from 'react'
import { globalSearch } from '@/lib/api'
import { Search, BookOpen, FileText, Award, X, ChevronRight } from 'lucide-react'

export default function SearchView() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) { setResults(null); setSearched(false); return }
    const timer = setTimeout(async () => { setLoading(true); setSearched(true); try { setResults(await globalSearch(query, 5)) } catch (e) { console.error(e) } finally { setLoading(false) } }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div>
      <div className="mb-6"><h2 className="text-lg font-medium text-neutral-900 mb-1">Qidirish</h2><p className="text-sm text-neutral-500">Materiallar, dars rejalari, testlar</p></div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Masalan: algebra, fotosintez..." className="input pl-9 !h-12 text-base" autoFocus />
        {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded"><X className="w-4 h-4 text-neutral-400" /></button>}
      </div>
      {loading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>}
      {!loading && searched && results && results.total === 0 && <div className="card p-12 text-center"><Search className="w-10 h-10 text-neutral-300 mx-auto mb-3" /><p className="text-neutral-500">"{query}" bo'yicha hech narsa topilmadi</p></div>}
      {!loading && results && results.total > 0 && (
        <div className="space-y-6">
          {results.materials?.length > 0 && (<div><h3 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4" />Materiallar ({results.materials.length})</h3><div className="space-y-1">{results.materials.map((m: any) => (<div key={m.id} className="card p-3 hover:border-neutral-400 transition-colors flex items-center justify-between group cursor-pointer"><div className="flex-1 min-w-0"><h4 className="font-medium text-sm text-neutral-900 group-hover:text-neutral-700 truncate">{m.title}</h4>{m.description && <p className="text-xs text-neutral-500 truncate">{m.description}</p>}<div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">{m.subject?.name && <span>{m.subject.name}</span>}<span>•</span><span>{m.isFree || m.price === 0 ? 'Bepul' : `${m.price} COIN`}</span></div></div><ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600" /></div>))}</div></div>)}
          {results.lessonPlans?.length > 0 && (<div><h3 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" />Dars rejalari ({results.lessonPlans.length})</h3><div className="space-y-1">{results.lessonPlans.map((p: any) => (<div key={p.id} className="card p-3 hover:border-neutral-400 transition-colors flex items-center justify-between group cursor-pointer"><div className="flex-1 min-w-0"><h4 className="font-medium text-sm text-neutral-900 group-hover:text-neutral-700 truncate">{p.title}</h4>{p.description && <p className="text-xs text-neutral-500 truncate">{p.description}</p>}</div><ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600" /></div>))}</div></div>)}
          {results.lessonMaterials?.length > 0 && (<div><h3 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" />Dars ishlanmalari ({results.lessonMaterials.length})</h3><div className="space-y-1">{results.lessonMaterials.map((m: any) => (<div key={m.id} className="card p-3 hover:border-neutral-400 transition-colors flex items-center justify-between group cursor-pointer"><div className="flex-1 min-w-0"><h4 className="font-medium text-sm text-neutral-900 group-hover:text-neutral-700 truncate">{m.title}</h4>{m.description && <p className="text-xs text-neutral-500 truncate">{m.description}</p>}</div><ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600" /></div>))}</div></div>)}
          {results.tests?.length > 0 && (<div><h3 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2"><Award className="w-4 h-4" />Testlar ({results.tests.length})</h3><div className="space-y-1">{results.tests.map((t: any) => (<div key={t.id} className="card p-3 hover:border-neutral-400 transition-colors flex items-center justify-between group cursor-pointer"><div className="flex-1 min-w-0"><h4 className="font-medium text-sm text-neutral-900 group-hover:text-neutral-700 truncate">{t.title}</h4>{t.description && <p className="text-xs text-neutral-500 truncate">{t.description}</p>}</div><ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600" /></div>))}</div></div>)}
        </div>
      )}
      {!searched && <div className="card p-12 text-center"><Search className="w-10 h-10 text-neutral-300 mx-auto mb-3" /><p className="text-neutral-500">Qidirish uchun so'z kiriting</p><p className="text-neutral-400 text-sm mt-1">Kamida 2 ta belgi</p></div>}
    </div>
  )
}
