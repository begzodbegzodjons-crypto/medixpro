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
      {/* Hero - Image full width, text below */}
      <section className="mb-8">
        <div className="relative h-48 md:h-64 lg:h-80 overflow-hidden rounded-xl">
          <img src="/hero-teacher.jpg" alt="O'qituvchi va o'quvchilar" className="w-full h-full object-cover" />
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 tracking-tight mb-2">
            O'qituvchilar uchun professional platforma
          </h1>
          <p className="text-neutral-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Dars ishlanmalari, dars rejalari, testlar, ko'rgazmalar, to'garak hujjatlari va ish hujjatlari — barchasi bir joyda, bepul
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="text-center py-4 px-2 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{subjects.length}</div>
          <div className="text-xs md:text-sm text-neutral-500 mt-0.5">Fanlar</div>
        </div>
        <div className="text-center py-4 px-2 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{totalTopics}</div>
          <div className="text-xs md:text-sm text-neutral-500 mt-0.5">Mavzular</div>
        </div>
        <div className="text-center py-4 px-2 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{totalTests}</div>
          <div className="text-xs md:text-sm text-neutral-500 mt-0.5">Testlar</div>
        </div>
        <div className="text-center py-4 px-2 border border-neutral-200 rounded-lg">
          <div className="text-xl md:text-2xl font-semibold text-neutral-900">{totalMaterials}</div>
          <div className="text-xs md:text-sm text-neutral-500 mt-0.5">Materiallar</div>
        </div>
      </section>

      {/* Sections with images */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-400 transition-colors">
          <img src="/hero-books.jpg" alt="Dars rejalari" className="w-full h-32 object-cover" />
          <div className="p-4">
            <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Dars rejalari</h3>
            <p className="text-xs text-neutral-500">5-11 sinflar uchun</p>
          </div>
        </div>
        <div className="border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-400 transition-colors">
          <img src="/hero-students.jpg" alt="Dars ishlanmalari" className="w-full h-32 object-cover" />
          <div className="p-4">
            <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Dars ishlanmalari</h3>
            <p className="text-xs text-neutral-500">Prezentatsiyalar, varaqalar</p>
          </div>
        </div>
        <div className="border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-400 transition-colors">
          <div className="w-full h-32 bg-neutral-100 flex items-center justify-center text-4xl">✅</div>
          <div className="p-4">
            <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Testlar</h3>
            <p className="text-xs text-neutral-500">Savol-javob va HTML</p>
          </div>
        </div>
        <div className="border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-400 transition-colors">
          <img src="/hero-teacher.jpg" alt="Ish hujjatlari" className="w-full h-32 object-cover" />
          <div className="p-4">
            <h3 className="font-medium text-neutral-900 text-sm mb-0.5">Ish hujjatlari</h3>
            <p className="text-xs text-neutral-500">To'garak va ko'rgazmalar</p>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section>
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Fanlar bo'yicha</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors cursor-pointer text-center">
              <div className="text-2xl md:text-3xl mb-1.5">{subject.icon || '📚'}</div>
              <div className="text-sm font-medium text-neutral-900 leading-tight">{subject.name}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
