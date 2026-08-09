'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>
  }

  const totalTests = subjects.reduce((s, x) => s + (x._count?.tests || 0), 0)
  const totalMaterials = subjects.reduce((s, x) => s + (x._count?.materials || 0), 0)
  const totalTopics = subjects.reduce((s, x) => s + (x._count?.topics || 0), 0)

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Hero */}
      <div className="py-12 md:py-16 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 tracking-tight mb-3 leading-tight">
          O'qituvchilar uchun platforma
        </h1>
        <p className="text-neutral-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Dars ishlanmalari, dars rejalari, testlar, ko'rgazmalar, to'garak hujjatlari 
          va ish hujjatlari — barchasi bir joyda, bepul
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-12">
        <div className="text-center p-3 md:p-4 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{subjects.length}</div>
          <div className="text-[10px] md:text-xs text-neutral-500 mt-0.5">Fanlar</div>
        </div>
        <div className="text-center p-3 md:p-4 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{totalTopics}</div>
          <div className="text-[10px] md:text-xs text-neutral-500 mt-0.5">Mavzular</div>
        </div>
        <div className="text-center p-3 md:p-4 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{totalTests}</div>
          <div className="text-[10px] md:text-xs text-neutral-500 mt-0.5">Testlar</div>
        </div>
        <div className="text-center p-3 md:p-4 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{totalMaterials}</div>
          <div className="text-[10px] md:text-xs text-neutral-500 mt-0.5">Materiallar</div>
        </div>
      </div>

      {/* Sections overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
        <div className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Dars rejalari</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">5-11 sinflar uchun tayyor dars rejalari</p>
        </div>
        <div className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Dars ishlanmalari</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">Prezentatsiyalar, ish varaqalari, videolar</p>
        </div>
        <div className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-2xl mb-2">✅</div>
          <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Testlar</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">Savol-javob va HTML formatdagi testlar</p>
        </div>
        <div className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
          <div className="text-2xl mb-2">📁</div>
          <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Ish hujjatlari</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">To'garak hujjatlari va ko'rgazmalar</p>
        </div>
      </div>

      {/* Subjects */}
      <h2 className="text-base font-medium text-neutral-900 mb-4">Fanlar bo'yicha</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-8">
        {subjects.map((subject) => (
          <div key={subject.id} className="p-3 md:p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xl md:text-2xl">{subject.icon || '📚'}</span>
              {subject._count && (
                <span className="text-[10px] text-neutral-400">{subject._count.tests + subject._count.materials}</span>
              )}
            </div>
            <h3 className="font-medium text-neutral-900 text-sm">{subject.name}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}
