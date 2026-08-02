'use client'

import { useEffect, useState } from 'react'
import { Trash2, Edit2, Plus, X, FileText, Video, ExternalLink } from 'lucide-react'

interface Subject {
  id: string
  name: string
}

interface Material {
  id: string
  title: string
  description?: string
  fileUrl: string
  type: 'pdf' | 'video'
  price: number
  subjectId: string
  subject?: Subject
  createdAt: string
}

const EMPTY_FORM = {
  title: '',
  description: '',
  subjectId: '',
  fileUrl: '',
  type: 'pdf' as 'pdf' | 'video',
  price: 50,
}

export default function MaterialsManager() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMaterials()
    fetchSubjects()
  }, [])

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/materials', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setMaterials(data)
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/subjects', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subjectId || !formData.title || !formData.fileUrl) {
      alert('Fan, sarlavha va fayl URL talab qilinadi')
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('adminToken')
      const url = editingId ? `/api/admin/materials/${editingId}` : '/api/admin/materials'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectId: formData.subjectId,
          title: formData.title,
          description: formData.description,
          fileUrl: formData.fileUrl,
          type: formData.type,
          price: Number(formData.price),
        }),
      })

      if (response.ok) {
        resetForm()
        fetchMaterials()
      } else {
        const err = await response.json()
        alert(err.message || 'Xato yuz berdi')
      }
    } catch (error) {
      console.error('Failed to save material:', error)
      alert('Saqlashda xato yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Materialni o'chirishni tasdiqlaysizmi?")) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/materials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        fetchMaterials()
      }
    } catch (error) {
      console.error('Failed to delete material:', error)
    }
  }

  const handleEdit = (mat: Material) => {
    setEditingId(mat.id)
    setFormData({
      title: mat.title,
      description: mat.description || '',
      subjectId: mat.subjectId,
      fileUrl: mat.fileUrl,
      type: mat.type,
      price: mat.price,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600 mt-2">Materiallarni boshqaring va qo&apos;shing</p>
        </div>
        <button
          onClick={() => {
            setFormData(EMPTY_FORM)
            setEditingId(null)
            setShowForm(!showForm)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Bekor qilish' : 'Yangi Material'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? 'Materialni tahrirlash' : 'Yangi material qo\'shish'}
            </h2>
            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sarlavha
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: Algebra - Tenglamalar (PDF)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fan
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">Fanni tanlang</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tavsif
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Material tavsifi..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turi
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'pdf' | 'video' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Narxi (COIN)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fayl URL
                </label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Eslatma:</strong> Fayl URL manzilini kiriting. Tashqi hostingda joylashtirilgan
                PDF yoki video bo&apos;lishi mumkin.
              </p>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saqlanmoqda...' : editingId ? 'Yangilash' : 'Material saqlash'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {materials.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Materiallar mavjud emas. Yangi material qo&apos;shing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Sarlavha
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Fan
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Turi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Narxi
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Harakatlar
                  </th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat) => (
                  <tr key={mat.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {mat.type === 'pdf' ? (
                          <FileText className="w-4 h-4 text-red-600" />
                        ) : (
                          <Video className="w-4 h-4 text-blue-600" />
                        )}
                        {mat.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {mat.subject?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        mat.type === 'pdf'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {mat.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      {mat.price} COIN
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Ko'rish"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleEdit(mat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(mat.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
