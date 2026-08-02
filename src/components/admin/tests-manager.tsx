'use client'

import { useEffect, useState } from 'react'
import { Trash2, Edit2, Plus, Eye, X } from 'lucide-react'

interface Subject {
  id: string
  name: string
}

interface Question {
  id: number
  text: string
  options: string[]
}

interface Test {
  id: string
  title: string
  description?: string
  subjectId: string
  subject?: Subject
  questions: Question[]
  correctAnswers: string[]
  passingScore: number
  timeLimit?: number | null
  createdAt: string
}

const EMPTY_FORM = {
  title: '',
  description: '',
  subjectId: '',
  passingScore: 60,
  timeLimit: 30,
  questions: [
    { id: 1, text: '', options: ['', '', '', ''] },
  ] as Question[],
  correctAnswers: [''] as string[],
}

export default function TestsManager() {
  const [tests, setTests] = useState<Test[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [viewingTest, setViewingTest] = useState<Test | null>(null)

  useEffect(() => {
    fetchTests()
    fetchSubjects()
  }, [])

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/tests', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setTests(data)
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error)
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

  const handleAddQuestion = () => {
    const newId = formData.questions.length + 1
    setFormData({
      ...formData,
      questions: [...formData.questions, { id: newId, text: '', options: ['', '', '', ''] }],
      correctAnswers: [...formData.correctAnswers, ''],
    })
  }

  const handleRemoveQuestion = (idx: number) => {
    if (formData.questions.length === 1) return
    const newQuestions = formData.questions.filter((_, i) => i !== idx)
    const newAnswers = formData.correctAnswers.filter((_, i) => i !== idx)
    // Renumber
    newQuestions.forEach((q, i) => (q.id = i + 1))
    setFormData({ ...formData, questions: newQuestions, correctAnswers: newAnswers })
  }

  const handleQuestionChange = (idx: number, field: 'text', value: string) => {
    const newQuestions = [...formData.questions]
    newQuestions[idx] = { ...newQuestions[idx], [field]: value }
    setFormData({ ...formData, questions: newQuestions })
  }

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    const newQuestions = [...formData.questions]
    const newOptions = [...newQuestions[qIdx].options]
    newOptions[optIdx] = value
    newQuestions[qIdx] = { ...newQuestions[qIdx], options: newOptions }
    setFormData({ ...formData, questions: newQuestions })
  }

  const handleCorrectAnswerChange = (qIdx: number, value: string) => {
    const newAnswers = [...formData.correctAnswers]
    newAnswers[qIdx] = value
    setFormData({ ...formData, correctAnswers: newAnswers })
  }

  const handleAddOption = (qIdx: number) => {
    const newQuestions = [...formData.questions]
    newQuestions[qIdx] = {
      ...newQuestions[qIdx],
      options: [...newQuestions[qIdx].options, ''],
    }
    setFormData({ ...formData, questions: newQuestions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subjectId || !formData.title) {
      alert('Fan va sarlavha talab qilinadi')
      return
    }

    if (formData.questions.some((q) => !q.text.trim())) {
      alert('Barcha savollar to\'ldirilishi kerak')
      return
    }

    if (formData.correctAnswers.some((a) => !a.trim())) {
      alert('Barcha savollarga to\'g\'ri javob belgilanishi kerak')
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('adminToken')
      const url = editingId ? `/api/admin/tests/${editingId}` : '/api/admin/tests'
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
          questions: formData.questions,
          correctAnswers: formData.correctAnswers,
          passingScore: Number(formData.passingScore),
          timeLimit: formData.timeLimit ? Number(formData.timeLimit) : null,
        }),
      })

      if (response.ok) {
        resetForm()
        fetchTests()
      } else {
        const err = await response.json()
        alert(err.message || 'Xato yuz berdi')
      }
    } catch (error) {
      console.error('Failed to save test:', error)
      alert('Saqlashda xato yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Testni o'chirishni tasdiqlaysizmi?")) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/tests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        fetchTests()
      }
    } catch (error) {
      console.error('Failed to delete test:', error)
    }
  }

  const handleEdit = (test: Test) => {
    setEditingId(test.id)
    setFormData({
      title: test.title,
      description: test.description || '',
      subjectId: test.subjectId,
      passingScore: test.passingScore,
      timeLimit: test.timeLimit || 30,
      questions: test.questions,
      correctAnswers: test.correctAnswers,
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
          <h1 className="text-4xl font-bold text-gray-900">Testlar</h1>
          <p className="text-gray-600 mt-2">Testlarni boshqaring va yarating</p>
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
          {showForm ? 'Bekor qilish' : 'Yangi Test'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? 'Testni tahrirlash' : 'Yangi test yaratish'}
            </h2>
            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Sarlavhasi
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: Matematika - Tenglamalar"
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
                placeholder="Test tavsifi..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O&apos;tish bali (%)
                </label>
                <input
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vaqt chegarasi (daqiqada)
                </label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Questions section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Savollar</h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  Savol qo&apos;shish
                </button>
              </div>

              <div className="space-y-6">
                {formData.questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-700">Savol {qIdx + 1}</span>
                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="text-red-600 hover:bg-red-100 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <textarea
                      value={q.text}
                      onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)}
                      placeholder="Savol matnini kiriting..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-3"
                      required
                    />

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={formData.correctAnswers[qIdx] === opt}
                            onChange={() => handleCorrectAnswerChange(qIdx, opt)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Variant ${optIdx + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newQuestions = [...formData.questions]
                                newQuestions[qIdx].options = newQuestions[qIdx].options.filter((_, i) => i !== optIdx)
                                if (formData.correctAnswers[qIdx] === opt) {
                                  const newAnswers = [...formData.correctAnswers]
                                  newAnswers[qIdx] = ''
                                  setFormData({ ...formData, questions: newQuestions, correctAnswers: newAnswers })
                                } else {
                                  setFormData({ ...formData, questions: newQuestions })
                                }
                              }}
                              className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {q.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                      >
                        + Variant qo&apos;shish
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saqlanmoqda...' : editingId ? 'Yangilash' : 'Test saqlash'}
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

      {/* Tests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {tests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Testlar mavjud emas. Yangi test qo&apos;shing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Sarlavhasi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Fan
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Savollar
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    O&apos;tish bali
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Harakatlar
                  </th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{test.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {test.subject?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {Array.isArray(test.questions) ? test.questions.length : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {test.passingScore}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingTest(test)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(test)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
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

      {/* View Modal */}
      {viewingTest && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setViewingTest(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{viewingTest.title}</h2>
                <button
                  onClick={() => setViewingTest(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {viewingTest.description && (
                <p className="text-gray-600 text-sm mt-1">{viewingTest.description}</p>
              )}
            </div>
            <div className="p-6 space-y-4">
              {viewingTest.questions.map((q, idx) => (
                <div key={idx} className="border-b pb-4">
                  <p className="font-semibold text-gray-900 mb-2">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="space-y-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`px-3 py-2 rounded text-sm ${
                          viewingTest.correctAnswers[idx] === opt
                            ? 'bg-green-100 text-green-800 font-medium'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {opt}
                        {viewingTest.correctAnswers[idx] === opt && ' ✓'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
