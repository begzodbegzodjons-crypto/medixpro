'use client'

import { useEffect, useState } from 'react'

interface Subject {
  id: string
  name: string
  icon?: string
  order: number
  _count?: { tests: number; materials: number; topics: number }
}

export default function SubjectGrid() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/subjects')
        if (res.ok) setSubjects(await res.json())
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>
  }

  const totalTests = subjects.reduce((s, x) => s + (x._count?.tests || 0), 0)
  const totalMaterials = subjects.reduce((s, x) => s + (x._count?.materials || 0), 0)
  const totalTopics = subjects.reduce((s, x) => s + (x._count?.topics || 0), 0)

  return (
    <div>
      {/* Hero */}
      <div className="py-8 md:py-10 text-center">
        <h1 className="text-xl md:text-2xl font-semibold text-neutral-900 tracking-tight mb-2 leading-tight">
          O'qituvchilar uchun platforma
        </h1>
        <p className="text-neutral-500 text-sm max-w-2xl mx-auto leading-relaxed">
          Dars ishlanmalari, dars rejalari, testlar, ko'rgazmalar, to'garak hujjatlari va ish hujjatlari — barchasi bir joyda, bepul
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="text-center py-3 px-2 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{subjects.length}</div>
          <div className="text-xs text-neutral-500 mt-0.5">Fanlar</div>
        </div>
        <div className="text-center py-3 px-2 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{totalTopics}</div>
          <div className="text-xs text-neutral-500 mt-0.5">Mavzular</div>
        </div>
        <div className="text-center py-3 px-2 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{totalTests}</div>
          <div className="text-xs text-neutral-500 mt-0.5">Testlar</div>
        </div>
        <div className="text-center py-3 px-2 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{totalMaterials}</div>
          <div className="text-xs text-neutral-500 mt-0.5">Materiallar</div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Dars rejalari</h3>
          <p className="text-xs text-neutral-500">5-11 sinflar uchun</p>
        </div>
        <div className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Dars ishlanmalari</h3>
          <p className="text-xs text-neutral-500">Prezentatsiyalar, varaqalar</p>
        </div>
        <div className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-2xl mb-2">✅</div>
          <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Testlar</h3>
          <p className="text-xs text-neutral-500">Savol-javob va HTML</p>
        </div>
        <div className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-2xl mb-2">📁</div>
          <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Ish hujjatlari</h3>
          <p className="text-xs text-neutral-500">To'garak va ko'rgazmalar</p>
        </div>
      </div>

      {/* Subjects */}
      <h2 className="text-sm font-medium text-neutral-900 mb-3">Fanlar bo'yicha</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors cursor-pointer text-center">
            <div className="text-2xl mb-1.5">{subject.icon || '📚'}</div>
            <div className="text-sm font-medium text-neutral-900 leading-tight">{subject.name}</div>
            {subject._count && (
              <div className="text-[10px] text-neutral-400 mt-1">{subject._count.tests + subject._count.materials} material</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
