'use client'

import { useEffect, useState } from 'react'
import { getLessonPlans, getLessonPlanById, getSubjects } from '@/lib/api'
import { BookOpen, ArrowLeft, Clock, User, ChevronRight, Search, X } from 'lucide-react'

interface Subject { id: string; name: string; icon?: string }
interface LessonPlan {
  id: string
  title: string
  description?: string
  classLevel?: number | null
  duration: number
  createdAt: string
  subject?: { id: string; name: string; icon?: string }
  topic?: { id: string; name: string }
  author?: { id: string; name: string }
}

export default function LessonPlans() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [viewingPlan, setViewingPlan] = useState<any | null>(null)

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // Always load - if no subject selected, show all public lesson plans
    loadPlans(1)
  }, [selectedSubject, selectedClass, search])

  const loadPlans = async (pageNum: number) => {
    setLoadingPlans(true)
    try {
      const data = await getLessonPlans({
        subjectId: selectedSubject || undefined,
        classLevel: selectedClass || undefined,
        search: search || undefined,
        page: pageNum,
      })
      setPlans(data.items || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
      setPage(pageNum)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleView = async (id: string) => {
    try {
      const plan = await getLessonPlanById(id)
      setViewingPlan(plan)
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Detail view
  if (viewingPlan) {
    const content = viewingPlan.content || {}
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setViewingPlan(null)}
          className="mb-4 flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Ro&apos;yhatga qayt
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="mb-4">
            {viewingPlan.subject?.icon && <span className="text-3xl">{viewingPlan.subject.icon}</span>}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{viewingPlan.title}</h1>
            {viewingPlan.description && (
              <p className="text-gray-600 mt-2 text-sm md:text-base">{viewingPlan.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs md:text-sm text-gray-500">
              {viewingPlan.subject && <span>Fan: {viewingPlan.subject.name}</span>}
              {viewingPlan.topic && <span>Mavzu: {viewingPlan.topic.name}</span>}
              {viewingPlan.classLevel && <span>Sinf: {viewingPlan.classLevel}</span>}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {viewingPlan.duration || 45} daqiqa</span>
              {viewingPlan.author?.name && (
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {viewingPlan.author.name}</span>
              )}
            </div>
          </div>

          <div className="prose max-w-none">
            {content.objectives && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🎯 Maqsadlar</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  {(Array.isArray(content.objectives) ? content.objectives : [content.objectives]).map((o: string, i: number) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
            )}

            {content.materials && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">📚 Kerakli materiallar</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  {(Array.isArray(content.materials) ? content.materials : [content.materials]).map((m: string, i: number) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {content.stages && Array.isArray(content.stages) && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">📝 Dars bosqichlari</h3>
                <div className="space-y-3">
                  {content.stages.map((stage: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 md:p-4">
                      <div className="flex items-start gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base">{stage.name || `Bosqich ${i + 1}`}</h4>
                          {stage.duration && <span className="text-xs text-gray-500">{stage.duration} daqiqa</span>}
                          {stage.description && <p className="text-gray-700 text-sm mt-1">{stage.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.homework && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🏠 Uy vazifasi</h3>
                <p className="text-gray-700 text-sm">{content.homework}</p>
              </div>
            )}

            {content.assessment && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">✅ Baholash</h3>
                <p className="text-gray-700 text-sm">{content.assessment}</p>
              </div>
            )}

            {content.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">📋 Izohlar</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{content.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dars rejalari 📚</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Barcha fanlar bo&apos;yicha tayyor dars rejalari (bepul)
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedSubject(null)
              setSelectedClass('')
              setSearch('')
            }}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium ${
              !selectedSubject
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Barcha fanlar
          </button>
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSubject(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium ${
                selectedSubject === s.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {s.icon && <span className="mr-1">{s.icon}</span>}
              {s.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Barcha sinflar</option>
            {[5, 6, 7, 8, 9, 10, 11].map((c) => (
              <option key={c} value={String(c)}>{c}-sinf</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Dars rejasini qidirish..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plans list */}
      {loadingPlans ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-lg p-8 md:p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">Dars rejalari topilmadi</p>
          <p className="text-gray-500 text-sm">Boshqa filtrlarni urinib ko&apos;ring</p>
        </div>
      ) : (
        <>
          <p className="text-xs md:text-sm text-gray-500 mb-3">{total} ta dars rejasi topildi</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleView(plan.id)}
                className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow text-left flex flex-col group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {plan.subject?.icon && <span className="text-2xl">{plan.subject.icon}</span>}
                    <h3 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-blue-600 transition-colors">
                      {plan.title}
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                {plan.description && (
                  <p className="text-gray-600 text-xs md:text-sm mb-3 flex-1 line-clamp-2">{plan.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  {plan.subject && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{plan.subject.name}</span>}
                  {plan.classLevel && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{plan.classLevel}-sinf</span>}
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {plan.duration || 45} daq</span>
                  {plan.author?.name && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {plan.author.name}</span>}
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => loadPlans(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Oldingi
              </button>
              <span className="text-sm text-gray-600">{page} / {totalPages}</span>
              <button
                onClick={() => loadPlans(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
