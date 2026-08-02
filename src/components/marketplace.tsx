'use client'

import { useEffect, useState } from 'react'
import { getSubjects, getMaterials, purchaseMaterial } from '@/app/actions'
import { ShoppingCart, Download } from 'lucide-react'

export default function Marketplace() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

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

  const handleSubjectSelect = async (subjectId: string) => {
    setSelectedSubject(subjectId)
    try {
      const materialsData = await getMaterials(subjectId)
      setMaterials(materialsData)
    } catch (error) {
      console.error('Failed to load materials', error)
    }
  }

  const handlePurchase = async (materialId: string) => {
    try {
      setPurchasing(materialId)
      await purchaseMaterial(materialId)
      // Reload materials
      if (selectedSubject) {
        const updated = await getMaterials(selectedSubject)
        setMaterials(updated)
      }
    } catch (error: any) {
      alert(error.message || 'Xato orzi qilindi')
    } finally {
      setPurchasing(null)
    }
  }

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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h2>
        <p className="text-gray-600">Testlarda qo'llantirilish uchun darsliklar va videolarni sotin oling</p>
      </div>

      {!selectedSubject ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fanni tanlang</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => handleSubjectSelect(subject.id)}
                className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all text-left"
              >
                <h3 className="font-bold text-gray-900">{subject.name}</h3>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedSubject(null)}
            className="mb-6 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            ← Orqaga
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.length > 0 ? (
              materials.map((material) => (
                <div key={material.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex-1">{material.title}</h3>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {material.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{material.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">{material.price} COIN</span>
                    <button
                      onClick={() => handlePurchase(material.id)}
                      disabled={purchasing === material.id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {purchasing === material.id ? 'Sotilmoqda...' : 'Sotin oling'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">Ushbu fanda material yoq</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
