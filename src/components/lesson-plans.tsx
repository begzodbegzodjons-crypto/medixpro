'use client'

import { useEffect, useState } from 'react'
import { getLessonPlans, getLessonPlanById, getSubjects } from '@/lib/api'
import { ArrowLeft, Clock, User, ChevronRight, Search, X } from 'lucide-react'

interface Subject { id: string; name: string; icon?: string }

export default function LessonPlans() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [viewingPlan, setViewingPlan] = useState<any | null>(null)

  useEffect(() => { getSubjects().then(setSubjects).catch(console.error).finally(() => setLoading(false)) }, [])
  useEffect(() => { loadPlans(1) }, [selectedSubject, selectedClass, search])

  const loadPlans = async (pageNum: number) => {
    setLoadingPlans(true)
    try {
      const data = await getLessonPlans({ subjectId: selectedSubject || undefined, classLevel: selectedClass || undefined, search: search || undefined, page: pageNum })
      setPlans(data.items || []); setTotalPages(data.pagination?.totalPages || 1); setTotal(data.pagination?.total || 0); setPage(pageNum)
    } catch (e) { console.error(e) } finally { setLoadingPlans(false) }
  }

  const handleView = async (id: string) => { try { setViewingPlan(await getLessonPlanById(id)) } catch (e) { console.error(e) } }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>

  if (viewingPlan) {
    const content = viewingPlan.content || {}
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setViewingPlan(null)} className="mb-4 flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900"><ArrowLeft className="w-4 h-4" /> Ro'yhatga qayt</button>
        <div className="card p-6 md:p-8">
          <div className="mb-4">
            {viewingPlan.subject?.icon && <span className="text-2xl">{viewingPlan.subject.icon}</span>}
            <h1 className="text-xl font-semibold text-neutral-900 mt-2">{viewingPlan.title}</h1>
            {viewingPlan.description && <p className="text-neutral-500 mt-2 text-sm">{viewingPlan.description}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-400">
              {viewingPlan.subject && <span>{viewingPlan.subject.name}</span>}
              {viewingPlan.topic && <span>• {viewingPlan.topic.name}</span>}
              {viewingPlan.classLevel && <span>• {viewingPlan.classLevel}-sinf</span>}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {viewingPlan.duration || 45} daqiqa</span>
              {viewingPlan.author?.name && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {viewingPlan.author.name}</span>}
            </div>
          </div>
          <div className="prose max-w-none text-sm">
            {content.objectives && <div className="mb-6"><h3 className="font-medium text-neutral-900 mb-2">Maqsadlar</h3><ul className="list-disc list-inside space-y-1 text-neutral-600">{(Array.isArray(content.objectives) ? content.objectives : [content.objectives]).map((o: string, i: number) => <li key={i}>{o}</li>)}</ul></div>}
            {content.materials && <div className="mb-6"><h3 className="font-medium text-neutral-900 mb-2">Kerakli materiallar</h3><ul className="list-disc list-inside space-y-1 text-neutral-600">{(Array.isArray(content.materials) ? content.materials : [content.materials]).map((m: string, i: number) => <li key={i}>{m}</li>)}</ul></div>}
            {content.stages && Array.isArray(content.stages) && <div className="mb-6"><h3 className="font-medium text-neutral-900 mb-2">Dars bosqichlari</h3><div className="space-y-2">{content.stages.map((stage: any, i: number) => (<div key={i} className="bg-neutral-50 rounded-lg p-3"><div className="flex items-start gap-2"><span className="bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">{i + 1}</span><div className="flex-1"><h4 className="font-medium text-neutral-900 text-sm">{stage.name}</h4>{stage.duration && <span className="text-xs text-neutral-400">{stage.duration} daqiqa</span>}{stage.description && <p className="text-neutral-600 text-sm mt-1">{stage.description}</p>}</div></div></div>))}</div></div>}
            {content.homework && <div className="mb-6"><h3 className="font-medium text-neutral-900 mb-2">Uy vazifasi</h3><p className="text-neutral-600">{content.homework}</p></div>}
            {content.assessment && <div className="mb-6"><h3 className="font-medium text-neutral-900 mb-2">Baholash</h3><p className="text-neutral-600">{content.assessment}</p></div>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6"><h2 className="text-lg font-medium text-neutral-900 mb-1">Dars rejalari</h2><p className="text-sm text-neutral-500">Tayyor dars rejalari (bepul)</p></div>
      <div className="card p-3 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => { setSelectedSubject(null); setSelectedClass(''); setSearch('') }} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!selectedSubject ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>Barcha fanlar</button>
          {subjects.map((s) => (<button key={s.id} onClick={() => setSelectedSubject(s.id)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedSubject === s.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>{s.icon && <span className="mr-1">{s.icon}</span>}{s.name}</button>))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="input !h-8 !w-auto text-xs"><option value="">Barcha sinflar</option>{[5, 6, 7, 8, 9, 10, 11].map((c) => <option key={c} value={String(c)}>{c}-sinf</option>)}</select>
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="input pl-9 !h-8 text-xs" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded"><X className="w-3 h-3" /></button>}
          </div>
        </div>
      </div>
      {loadingPlans ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div> : plans.length === 0 ? <div className="card p-12 text-center"><p className="text-neutral-500">Dars rejalari topilmadi</p></div> : (
        <>
          <p className="text-sm text-neutral-500 mb-3">{total} ta dars rejasi</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plans.map((plan) => (
              <button key={plan.id} onClick={() => handleView(plan.id)} className="card p-4 text-left hover:border-neutral-400 transition-colors group">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">{plan.subject?.icon && <span className="text-lg">{plan.subject.icon}</span>}<h3 className="font-medium text-neutral-900 text-sm group-hover:text-neutral-700">{plan.title}</h3></div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600" />
                </div>
                {plan.description && <p className="text-xs text-neutral-500 mb-2 line-clamp-2">{plan.description}</p>}
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                  {plan.subject && <span className="badge bg-neutral-100 text-neutral-600">{plan.subject.name}</span>}
                  {plan.classLevel && <span className="badge bg-neutral-100 text-neutral-600">{plan.classLevel}-sinf</span>}
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {plan.duration || 45} daq</span>
                </div>
              </button>
            ))}
          </div>
          {totalPages > 1 && <div className="flex justify-center items-center gap-2 mt-6"><button onClick={() => loadPlans(page - 1)} disabled={page === 1} className="btn-secondary !h-8 !px-3 text-xs">Oldingi</button><span className="text-sm text-neutral-500">{page} / {totalPages}</span><button onClick={() => loadPlans(page + 1)} disabled={page === totalPages} className="btn-secondary !h-8 !px-3 text-xs">Keyingi</button></div>}
        </>
      )}
    </div>
  )
}
