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
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>
  }

  const totalTests = subjects.reduce((s, x) => s + (x._count?.tests || 0), 0)
  const totalMaterials = subjects.reduce((s, x) => s + (x._count?.materials || 0), 0)
  const totalTopics = subjects.reduce((s, x) => s + (x._count?.topics || 0), 0)

  return (
    <div>
      {/* Hero */}
      <div className="py-10 md:py-14 text-center">
        <h1 className="text-2xl md:text-4xl font-semibold text-neutral-900 tracking-tight mb-3 leading-tight">
          O'qituvchilar uchun platforma
        </h1>
        <p className="text-neutral-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Dars ishlanmalari, dars rejalari, testlar, ko'rgazmalar, to'garak hujjatlari va ish hujjatlari — barchasi bir joyda, bepul
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="text-center py-5 px-2 border border-neutral-200 rounded-lg">
          <div className="text-2xl md:text-3xl font-semibold text-neutral-900">{subjects.length}</div>
          <div className="text-sm text-neutral-500 mt-1">Fanlar</div>
        </div>
        <div className="text-center py-5 px-2 border border-neutral-200 rounded-lg">
          <div className="text-2xl md:text-3xl font-semibold text-neutral-900">{totalTopics}</div>
          <div className="text-sm text-neutral-500 mt-1">Mavzular</div>
        </div>
        <div className="text-center py-5 px-2 border border-neutral-200 rounded-lg">
          <div className="text-2xl md:text-3xl font-semibold text-neutral-900">{totalTests}</div>
          <div className="text-sm text-neutral-500 mt-1">Testlar</div>
        </div>
        <div className="text-center py-5 px-2 border border-neutral-200 rounded-lg">
          <div className="text-2xl md:text-3xl font-semibold text-neutral-900">{totalMaterials}</div>
          <div className="text-sm text-neutral-500 mt-1">Materiallar</div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="p-5 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-medium text-neutral-900 text-base mb-1">Dars rejalari</h3>
          <p className="text-sm text-neutral-500">5-11 sinflar uchun</p>
        </div>
        <div className="p-5 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-3xl mb-3">📝</div>
          <h3 className="font-medium text-neutral-900 text-base mb-1">Dars ishlanmalari</h3>
          <p className="text-sm text-neutral-500">Prezentatsiyalar, varaqalar</p>
        </div>
        <div className="p-5 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-3xl mb-3">✅</div>
          <h3 className="font-medium text-neutral-900 text-base mb-1">Testlar</h3>
          <p className="text-sm text-neutral-500">Savol-javob va HTML</p>
        </div>
        <div className="p-5 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-3xl mb-3">📁</div>
          <h3 className="font-medium text-neutral-900 text-base mb-1">Ish hujjatlari</h3>
          <p className="text-sm text-neutral-500">To'garak va ko'rgazmalar</p>
        </div>
      </div>

      {/* Subjects */}
      <h2 className="text-lg font-medium text-neutral-900 mb-4">Fanlar bo'yicha</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="p-5 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors cursor-pointer text-center">
            <div className="text-3xl mb-2">{subject.icon || '📚'}</div>
            <div className="text-base font-medium text-neutral-900 leading-tight">{subject.name}</div>
            {subject._count && (
              <div className="text-sm text-neutral-400 mt-1">{subject._count.tests + subject._count.materials} material</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
