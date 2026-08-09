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
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 tracking-tight mb-3">
          O'qituvchilar uchun platforma
        </h1>
        <p className="text-neutral-500 text-base md:text-lg max-w-xl mx-auto">
          Testlar, dars rejalari, dars ishlanmalari va o'quv materiallari bir joyda
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200 rounded-xl overflow-hidden mb-12">
        <div className="bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-neutral-900">{subjects.length}</div>
          <div className="text-xs text-neutral-500 mt-0.5">Fanlar</div>
        </div>
        <div className="bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-neutral-900">{subjects.reduce((s, x) => s + (x._count?.tests || 0), 0)}</div>
          <div className="text-xs text-neutral-500 mt-0.5">Testlar</div>
        </div>
        <div className="bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-neutral-900">{subjects.reduce((s, x) => s + (x._count?.materials || 0), 0)}</div>
          <div className="text-xs text-neutral-500 mt-0.5">Materiallar</div>
        </div>
        <div className="bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-neutral-900">{subjects.reduce((s, x) => s + (x._count?.topics || 0), 0)}</div>
          <div className="text-xs text-neutral-500 mt-0.5">Mavzular</div>
        </div>
      </div>

      {/* Subjects */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Fanlar</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="card p-5 hover:border-neutral-400 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{subject.icon || '📚'}</span>
              {subject._count && (
                <span className="text-xs text-neutral-400">{subject._count.tests} test · {subject._count.materials} mat.</span>
              )}
            </div>
            <h3 className="font-medium text-neutral-900 mb-1">{subject.name}</h3>
            <p className="text-sm text-neutral-500">Testlar va materiallar</p>
          </div>
        ))}
      </div>
    </div>
  )
}
