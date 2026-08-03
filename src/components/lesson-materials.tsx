'use client'

import { useEffect, useState } from 'react'
import { getLessonMaterials, getLessonMaterialById, getSubjects } from '@/lib/api'
import { FileText, ArrowLeft, ExternalLink, Search, X, Video, Presentation, FileCheck } from 'lucide-react'

interface Subject { id: string; name: string; icon?: string }
interface LessonMaterial {
  id: string
  title: string
  description?: string
  type: string
  classLevel?: number | null
  createdAt: string
  subject?: { id: string; name: string; icon?: string }
  topic?: { id: string; name: string }
  author?: { id: string; name: string }
}

const TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  presentation: { label: 'Prezentatsiya', icon: Presentation, color: 'text-orange-600' },
  worksheet: { label: 'Ish varaqi', icon: FileCheck, color: 'text-green-600' },
  test: { label: 'Test', icon: FileCheck, color: 'text-red-600' },
  video: { label: 'Video', icon: Video, color: 'text-blue-600' },
  document: { label: 'Hujjat', icon: FileText, color: 'text-gray-600' },
}

export default function LessonMaterials() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [materials, setMaterials] = useState<LessonMaterial[]>([])
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

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // Always load - if no subject selected, show all public materials
    loadItems(1)
  }, [selectedSubject, selectedType, selectedClass, search])

  const loadItems = async (pageNum: number) => {
    setLoadingItems(true)
    try {
      const data = await getLessonMaterials({
        subjectId: selectedSubject || undefined,
        type: selectedType || undefined,
        classLevel: selectedClass || undefined,
        search: search || undefined,
        page: pageNum,
      })
      setMaterials(data.items || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
      setPage(pageNum)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingItems(false)
    }
  }

  const handleView = async (id: string) => {
    try {
      const item = await getLessonMaterialById(id)
      setViewingItem(item)
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
  if (viewingItem) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setViewingItem(null)}
          className="mb-4 flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Ro&apos;yhatga qayt
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="mb-4">
            {viewingItem.subject?.icon && <span className="text-3xl">{viewingItem.subject.icon}</span>}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{viewingItem.title}</h1>
            {viewingItem.description && (
              <p className="text-gray-600 mt-2 text-sm md:text-base">{viewingItem.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs md:text-sm text-gray-500">
              {viewingItem.subject && <span>Fan: {viewingItem.subject.name}</span>}
              {viewingItem.topic && <span>Mavzu: {viewingItem.topic.name}</span>}
              {viewingItem.classLevel && <span>Sinf: {viewingItem.classLevel}</span>}
              <span>Tur: {TYPE_LABELS[viewingItem.type]?.label || viewingItem.type}</span>
            </div>
          </div>

          {viewingItem.fileUrls && Array.isArray(viewingItem.fileUrls) && viewingItem.fileUrls.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Fayllar</h3>
              {viewingItem.fileUrls.map((url: string, i: number) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-900 group-hover:text-blue-600">
                    Fayl {i + 1}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
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
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dars ishlanmalari 📝</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Prezentatsiyalar, ish varaqalari va boshqa o&apos;quv materiallari (bepul)
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedSubject(null)
              setSelectedType('')
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Barcha turlar</option>
            <option value="presentation">Prezentatsiya</option>
            <option value="worksheet">Ish varaqi</option>
            <option value="test">Test</option>
            <option value="video">Video</option>
            <option value="document">Hujjat</option>
          </select>

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
              placeholder="Material qidirish..."
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

      {/* Materials list */}
      {loadingItems ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-lg p-8 md:p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">Materiallar topilmadi</p>
          <p className="text-gray-500 text-sm">Fan yoki filtrlarni tanlang</p>
        </div>
      ) : (
        <>
          <p className="text-xs md:text-sm text-gray-500 mb-3">{total} ta material topildi</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {materials.map((m) => {
              const typeInfo = TYPE_LABELS[m.type] || { label: m.type, icon: FileText, color: 'text-gray-600' }
              return (
                <button
                  key={m.id}
                  onClick={() => handleView(m.id)}
                  className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow text-left flex flex-col group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <typeInfo.icon className={`w-6 h-6 ${typeInfo.color}`} />
                    <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {typeInfo.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 group-hover:text-blue-600 transition-colors">
                    {m.title}
                  </h3>
                  {m.description && (
                    <p className="text-gray-600 text-xs md:text-sm mb-2 flex-1 line-clamp-2">{m.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-2">
                    {m.subject && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{m.subject.name}</span>}
                    {m.classLevel && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{m.classLevel}-sinf</span>}
                  </div>
                </button>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => loadItems(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Oldingi
              </button>
              <span className="text-sm text-gray-600">{page} / {totalPages}</span>
              <button
                onClick={() => loadItems(page + 1)}
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
