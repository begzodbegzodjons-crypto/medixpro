'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Calculator, Microscope, Globe, History, Music, Palette, PenTool, Monitor, Dumbbell, Award, Users, FileText, Layers } from 'lucide-react'

const SUBJECT_ICONS: { [key: string]: React.ReactNode } = {
  'Matematika': <Calculator className="w-7 h-7" />,
  'Fizika': <Microscope className="w-7 h-7" />,
  'Kimyo': <Microscope className="w-7 h-7" />,
  'Biologiya': <Microscope className="w-7 h-7" />,
  'Tarix': <History className="w-7 h-7" />,
  'Geografiya': <Globe className="w-7 h-7" />,
  'Adabiyot': <BookOpen className="w-7 h-7" />,
  "San'at": <Palette className="w-7 h-7" />,
  'Musiqa': <Music className="w-7 h-7" />,
  'Informatika': <Monitor className="w-7 h-7" />,
  'Jismoniy tarbiya': <Dumbbell className="w-7 h-7" />,
}

interface Subject {
  id: string
  name: string
  icon?: string
  order: number
  _count?: {
    tests: number
    materials: number
    topics: number
  }
}

export default function SubjectGrid() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <h2 className="text-2xl md:text-4xl font-bold mb-2">Xush kelibsiz, UstozPro! 🎓</h2>
        <p className="text-blue-100 text-sm md:text-base">
          O&apos;qituvchilar uchun professional platforma. Testlar, dars rejalari, dars ishlanmalari
          va ko&apos;plab o&apos;quv materiallari bir joyda.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="text-2xl font-bold">{subjects.length}</div>
            <div className="text-xs text-blue-100">Fanlar</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="text-2xl font-bold">
              {subjects.reduce((sum, s) => sum + (s._count?.tests || 0), 0)}
            </div>
            <div className="text-xs text-blue-100">Testlar</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="text-2xl font-bold">
              {subjects.reduce((sum, s) => sum + (s._count?.materials || 0), 0)}
            </div>
            <div className="text-xs text-blue-100">Materiallar</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="text-2xl font-bold">
              {subjects.reduce((sum, s) => sum + (s._count?.topics || 0), 0)}
            </div>
            <div className="text-xs text-blue-100">Mavzular</div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.reload()}>
          <div className="flex items-start justify-between mb-2">
            <Layers className="w-8 h-8 text-blue-500" />
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Bepul</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Dars rejalari</h3>
          <p className="text-sm text-gray-600">Barcha fanlar bo&apos;yicha tayyor dars rejalari</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.reload()}>
          <div className="flex items-start justify-between mb-2">
            <FileText className="w-8 h-8 text-green-500" />
            <span className="text-xs bg-green-100 text-green-700 px-2 rounded-full">Bepul</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Dars ishlanmalari</h3>
          <p className="text-sm text-gray-600">Tayyor prezentatsiyalar va ish varaqalari</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.reload()}>
          <div className="flex items-start justify-between mb-2">
            <Users className="w-8 h-8 text-purple-500" />
            <span className="text-xs bg-purple-100 text-purple-700 px-2 rounded-full">Hamjamiyat</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">O&apos;qituvchilar hamjamiyati</h3>
          <p className="text-sm text-gray-600">Boshqa o&apos;qituvchilar bilan tajriba almashish</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Fanlarni tanlang</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Kerakli fanni tanlab, testlar, dars rejalari va materiallarga kirishingiz mumkin
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer hover:scale-105 hover:border-blue-400 border-2 border-transparent"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-blue-600 group-hover:text-green-600 transition-colors">
                {subject.icon ? (
                  <span className="text-3xl">{subject.icon}</span>
                ) : (
                  SUBJECT_ICONS[subject.name] || <Award className="w-7 h-7" />
                )}
              </div>
              {subject._count && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {subject._count.tests} test • {subject._count.materials} mat.
                  </div>
                </div>
              )}
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{subject.name}</h3>
            <p className="text-gray-600 text-sm mb-4">Testlar orqali o&apos;zingizni sinab ko&apos;ring</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                +50 COIN / test
              </span>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium">
                Boshlash →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
