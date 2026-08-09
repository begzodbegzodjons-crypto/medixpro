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
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="py-8 md:py-10 text-center">
        <h1 className="text-lg md:text-xl font-semibold text-neutral-900 tracking-tight mb-1.5 leading-snug">
          O'qituvchilar uchun platforma
        </h1>
        <p className="text-neutral-500 text-xs md:text-[13px] max-w-sm mx-auto leading-relaxed">
          Dars ishlanmalari, dars rejalari, testlar va materiallar — bir joyda
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-8">
        <div className="text-center py-2 px-1 border border-neutral-200 rounded-md">
          <div className="text-base font-semibold text-neutral-900">{subjects.length}</div>
          <div className="text-[10px] text-neutral-500">Fanlar</div>
        </div>
        <div className="text-center py-2 px-1 border border-neutral-200 rounded-md">
          <div className="text-base font-semibold text-neutral-900">{totalTopics}</div>
          <div className="text-[10px] text-neutral-500">Mavzular</div>
        </div>
        <div className="text-center py-2 px-1 border border-neutral-200 rounded-md">
          <div className="text-base font-semibold text-neutral-900">{totalTests}</div>
          <div className="text-[10px] text-neutral-500">Testlar</div>
        </div>
        <div className="text-center py-2 px-1 border border-neutral-200 rounded-md">
          <div className="text-base font-semibold text-neutral-900">{totalMaterials}</div>
          <div className="text-[10px] text-neutral-500">Materiallar</div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-2 gap-2 mb-8">
        <div className="p-3 border border-neutral-200 rounded-md hover:border-neutral-400 transition-colors">
          <div className="text-lg mb-1">📋</div>
          <h3 className="font-medium text-neutral-900 text-xs">Dars rejalari</h3>
          <p className="text-[10px] text-neutral-500 mt-0.5">5-11 sinflar uchun</p>
        </div>
        <div className="p-3 border border-neutral-200 rounded-md hover:border-neutral-400 transition-colors">
          <div className="text-lg mb-1">📝</div>
          <h3 className="font-medium text-neutral-900 text-xs">Dars ishlanmalari</h3>
          <p className="text-[10px] text-neutral-500 mt-0.5">Prezentatsiyalar, varaqalar</p>
        </div>
        <div className="p-3 border border-neutral-200 rounded-md hover:border-neutral-400 transition-colors">
          <div className="text-lg mb-1">✅</div>
          <h3 className="font-medium text-neutral-900 text-xs">Testlar</h3>
          <p className="text-[10px] text-neutral-500 mt-0.5">Savol-javob va HTML</p>
        </div>
        <div className="p-3 border border-neutral-200 rounded-md hover:border-neutral-400 transition-colors">
          <div className="text-lg mb-1">📁</div>
          <h3 className="font-medium text-neutral-900 text-xs">Ish hujjatlari</h3>
          <p className="text-[10px] text-neutral-500 mt-0.5">To'garak va ko'rgazmalar</p>
        </div>
      </div>

      {/* Subjects */}
      <h2 className="text-xs font-medium text-neutral-900 mb-2.5">Fanlar</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 md:gap-2">
        {subjects.map((subject) => (
          <div key={subject.id} className="p-2.5 border border-neutral-200 rounded-md hover:border-neutral-400 transition-colors cursor-pointer text-center">
            <div className="text-base mb-0.5">{subject.icon || '📚'}</div>
            <div className="text-[11px] font-medium text-neutral-900 leading-tight">{subject.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
