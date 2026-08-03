'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, ArrowLeft, Search, X, Heart } from 'lucide-react'

interface Subject {
  id: string
  name: string
  icon?: string
}

interface Material {
  id: string
  title: string
  description?: string
  fileUrl: string
  type: string
  price: number
  isFree: boolean
  createdAt: string
  subject?: { id: string; name: string }
}

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

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await fetch('/api/subjects')
        if (res.ok) {
          const data = await res.json()
          setSubjects(data)
        }
      } catch (error) {
        console.error('Failed to load subjects', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubjects()
  }, [])

  useEffect(() => {
    if (!selectedSubject) return
    loadMaterials(1)
  }, [selectedSubject, search, filter])

  const loadMaterials = async (pageNum: number) => {
    if (!selectedSubject) return
    setLoadingMaterials(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        subjectId: selectedSubject,
        page: String(pageNum),
        limit: '12',
      })
      if (search) params.set('search', search)
      if (filter === 'free') params.set('isFree', 'true')

      const res = await fetch(`/api/materials?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMaterials(data.items || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || 0)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Failed to load materials', error)
      setError('Materiallarni yuklashda xato')
    } finally {
      setLoadingMaterials(false)
    }
  }

  const handlePurchase = async (materialId: string) => {
    setPurchasing(materialId)
    setError(null)
    try {
      const res = await fetch('/api/materials/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Xato yuz berdi')
      } else {
        // Reload page to reflect purchase
        await loadMaterials(page)
        // Trigger session refresh
        window.location.reload()
      }
    } catch (error) {
      setError('Sotib olishda xato')
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Marketplace</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Darsliklar, videolar va o&apos;quv materiallarini COIN orqali sotib oling
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!selectedSubject ? (
        <div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Fanni tanlang</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className="p-4 md:p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all text-left"
              >
                {subject.icon && <div className="text-3xl mb-2">{subject.icon}</div>}
                <h3 className="font-bold text-gray-900 text-sm md:text-base">{subject.name}</h3>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <button
              onClick={() => {
                setSelectedSubject(null)
                setMaterials([])
                setSearch('')
                setFilter('all')
              }}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Fanlarga qayt
            </button>

            {/* Search & filter */}
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Materiallarni qidirish..."
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
              <div className="flex gap-1">
                {(['all', 'free', 'paid'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'Barchasi' : f === 'free' ? 'Bepul' : 'Pullik'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loadingMaterials ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : materials.length === 0 ? (
            <div className="bg-white rounded-lg p-8 md:p-12 text-center">
              <p className="text-gray-600">Materiallar topilmadi</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">{total} ta material topildi</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {materials.map((material) => (
                  <div key={material.id} className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 flex-1 text-sm md:text-base">{material.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        material.type === 'pdf' ? 'bg-red-100 text-red-700' :
                        material.type === 'video' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {material.type.toUpperCase()}
                      </span>
                    </div>
                    {material.description && (
                      <p className="text-gray-600 text-xs md:text-sm mb-3 flex-1">{material.description}</p>
                    )}
                    {material.subject && (
                      <p className="text-xs text-gray-500 mb-3">Fan: {material.subject.name}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-base md:text-lg font-bold ${
                        material.isFree || material.price === 0 ? 'text-green-600' : 'text-green-600'
                      }`}>
                        {material.isFree || material.price === 0 ? 'Bepul' : `${material.price} COIN`}
                      </span>
                      <button
                        onClick={() => handlePurchase(material.id)}
                        disabled={purchasing === material.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {purchasing === material.id ? '...' : 'Olish'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => loadMaterials(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Oldingi
                  </button>
                  <span className="text-sm text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => loadMaterials(page + 1)}
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
      )}
    </div>
  )
}
