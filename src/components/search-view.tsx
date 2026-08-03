'use client'

import { useEffect, useState } from 'react'
import { globalSearch } from '@/lib/api'
import { Search, BookOpen, FileText, Award, X, ChevronRight } from 'lucide-react'

export default function SearchView() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    materials: any[]
    lessonPlans: any[]
    lessonMaterials: any[]
    tests: any[]
    total: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null)
      setSearched(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setSearched(true)
      try {
        const data = await globalSearch(query, 5)
        setResults(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Qidirish 🔍</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Materiallar, dars rejalari, dars ishlanmalari va testlarni qidiring
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Masalan: algebra, fotosintez, dars rejasi..."
          className="w-full pl-12 pr-12 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-base shadow-sm"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && searched && results && results.total === 0 && (
        <div className="bg-white rounded-lg p-8 md:p-12 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">&quot;{query}&quot; bo&apos;yicha hech narsa topilmadi</p>
          <p className="text-gray-500 text-sm">Boshqa so&apos;z bilan urinib ko&apos;ring</p>
        </div>
      )}

      {!loading && results && results.total > 0 && (
        <div className="space-y-6">
          {results.materials.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Materiallar ({results.materials.length})
              </h3>
              <div className="space-y-2">
                {results.materials.map((m) => (
                  <div key={m.id} className="bg-white rounded-lg shadow-sm p-3 md:p-4 hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate group-hover:text-blue-600">{m.title}</h4>
                      {m.description && <p className="text-xs md:text-sm text-gray-600 truncate">{m.description}</p>}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {m.subject?.name && <span>{m.subject.name}</span>}
                        <span>•</span>
                        <span>{m.isFree || m.price === 0 ? 'Bepul' : `${m.price} COIN`}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.lessonPlans.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Dars rejalari ({results.lessonPlans.length})
              </h3>
              <div className="space-y-2">
                {results.lessonPlans.map((p) => (
                  <div key={p.id} className="bg-white rounded-lg shadow-sm p-3 md:p-4 hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate group-hover:text-blue-600">{p.title}</h4>
                      {p.description && <p className="text-xs md:text-sm text-gray-600 truncate">{p.description}</p>}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {p.subject?.name && <span>{p.subject.name}</span>}
                        {p.classLevel && <><span>•</span><span>{p.classLevel}-sinf</span></>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.lessonMaterials.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Dars ishlanmalari ({results.lessonMaterials.length})
              </h3>
              <div className="space-y-2">
                {results.lessonMaterials.map((m) => (
                  <div key={m.id} className="bg-white rounded-lg shadow-sm p-3 md:p-4 hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate group-hover:text-blue-600">{m.title}</h4>
                      {m.description && <p className="text-xs md:text-sm text-gray-600 truncate">{m.description}</p>}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {m.subject?.name && <span>{m.subject.name}</span>}
                        <span>•</span>
                        <span>{m.type}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.tests.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                Testlar ({results.tests.length})
              </h3>
              <div className="space-y-2">
                {results.tests.map((t) => (
                  <div key={t.id} className="bg-white rounded-lg shadow-sm p-3 md:p-4 hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate group-hover:text-blue-600">{t.title}</h4>
                      {t.description && <p className="text-xs md:text-sm text-gray-600 truncate">{t.description}</p>}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {t.subject?.name && <span>{t.subject.name}</span>}
                        <span>•</span>
                        <span>O&apos;tish: {t.passingScore}%</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="bg-white rounded-lg p-8 md:p-12 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Qidirish uchun so&apos;z kiriting</p>
          <p className="text-gray-500 text-sm mt-1">Kamida 2 ta belgi kiriting</p>
        </div>
      )}
    </div>
  )
}
