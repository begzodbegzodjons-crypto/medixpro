'use client'

import { useEffect, useState } from 'react'
import { getSubjects } from '@/app/actions'
import { BookOpen, Calculator, Microscope, Globe, History, Music, Palette, PenTool, Monitor, Dumbbell, Award } from 'lucide-react'

const SUBJECT_ICONS: { [key: string]: React.ReactNode } = {
  'Mathematics': <Calculator className="w-8 h-8" />,
  'Physics': <Microscope className="w-8 h-8" />,
  'Chemistry': <Microscope className="w-8 h-8" />,
  'Biology': <Microscope className="w-8 h-8" />,
  'History': <History className="w-8 h-8" />,
  'Geography': <Globe className="w-8 h-8" />,
  'Literature': <BookOpen className="w-8 h-8" />,
  'Art': <Palette className="w-8 h-8" />,
  'Music': <Music className="w-8 h-8" />,
  'Computer Science': <Monitor className="w-8 h-8" />,
  'Physical Education': <Dumbbell className="w-8 h-8" />,
}

export default function SubjectGrid() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await getSubjects()
        setSubjects(data)
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Fanlarni tanlang</h2>
        <p className="text-gray-600">Kerakli fanni tanlab, testlarni boshlang va COIN daromad qiling</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer hover:scale-105 hover:border-blue-400 border-2 border-transparent"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-blue-600 group-hover:text-green-600 transition-colors">
                {SUBJECT_ICONS[subject.name] || <Award className="w-8 h-8" />}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{subject.name}</h3>
            <p className="text-gray-600 text-sm mb-4">Testlar orqali o'zingizni sinab ko'ring</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                50 COIN
              </span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Boshlash →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
