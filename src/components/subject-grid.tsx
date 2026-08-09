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
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-0 -mx-4 lg:-mx-4 mb-10">
        {/* Left - Text */}
        <div className="bg-neutral-900 text-white p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-4 leading-tight">
            O'qituvchilar uchun<br />professional platforma
          </h1>
          <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 max-w-md">
            Dars ishlanmalari, dars rejalari, testlar, ko'rgazmalar, to'garak hujjatlari va ish hujjatlari — barchasi bir joyda, bepul
          </p>
          <div className="grid grid-cols-4 gap-3 max-w-md">
            <div><div className="text-xl md:text-2xl font-semibold">{subjects.length}</div><div className="text-white/50 text-xs mt-0.5">Fanlar</div></div>
            <div><div className="text-xl md:text-2xl font-semibold">{totalTopics}</div><div className="text-white/50 text-xs mt-0.5">Mavzular</div></div>
            <div><div className="text-xl md:text-2xl font-semibold">{totalTests}</div><div className="text-white/50 text-xs mt-0.5">Testlar</div></div>
            <div><div className="text-xl md:text-2xl font-semibold">{totalMaterials}</div><div className="text-white/50 text-xs mt-0.5">Materiallar</div></div>
          </div>
        </div>
        {/* Right - Teacher Image */}
        <div className="relative h-64 lg:h-auto min-h-[300px]">
          <img src="/hero-teacher.png" alt="O'qituvchi" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Sections Overview */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-neutral-200 rounded-lg p-5 hover:border-neutral-400 transition-colors">
            <img src="/hero-books.png" alt="Dars rejalari" className="w-full h-32 object-cover rounded-md mb-3" />
            <h3 className="font-medium text-neutral-900 text-base mb-1">Dars rejalari</h3>
            <p className="text-sm text-neutral-500">5-11 sinflar uchun tayyor dars rejalari</p>
          </div>
          <div className="border border-neutral-200 rounded-lg p-5 hover:border-neutral-400 transition-colors">
            <div className="w-full h-32 bg-neutral-100 rounded-md mb-3 flex items-center justify-center text-4xl">📝</div>
            <h3 className="font-medium text-neutral-900 text-base mb-1">Dars ishlanmalari</h3>
            <p className="text-sm text-neutral-500">Prezentatsiyalar, ish varaqalari, videolar</p>
          </div>
          <div className="border border-neutral-200 rounded-lg p-5 hover:border-neutral-400 transition-colors">
            <div className="w-full h-32 bg-neutral-100 rounded-md mb-3 flex items-center justify-center text-4xl">✅</div>
            <h3 className="font-medium text-neutral-900 text-base mb-1">Testlar</h3>
            <p className="text-sm text-neutral-500">Savol-javob va HTML formatdagi testlar</p>
          </div>
          <div className="border border-neutral-200 rounded-lg p-5 hover:border-neutral-400 transition-colors">
            <img src="/hero-students.png" alt="Ish hujjatlari" className="w-full h-32 object-cover rounded-md mb-3" />
            <h3 className="font-medium text-neutral-900 text-base mb-1">Ish hujjatlari</h3>
            <p className="text-sm text-neutral-500">To'garak hujjatlari va ko'rgazmalar</p>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section>
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Fanlar bo'yicha</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="p-5 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors cursor-pointer text-center">
              <div className="text-3xl mb-2">{subject.icon || '📚'}</div>
              <div className="text-sm font-medium text-neutral-900 leading-tight">{subject.name}</div>
              {subject._count && (
                <div className="text-xs text-neutral-400 mt-1">{subject._count.tests + subject._count.materials} material</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
