'use client'

import { useEffect, useState } from 'react'
import { Trash2, Eye, EyeOff } from 'lucide-react'

interface Advertisement {
  id: string
  title: string
  description?: string
  imageUrl?: string
  fileType?: string
  position: string
  isActive: boolean
  link?: string
}

export default function AdvertisementsManager() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: 'sidebar',
    link: '',
    file: null as File | null,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/advertisements', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAds(data)
      }
    } catch (error) {
      console.error('[v0] Failed to fetch ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('title', formData.title)
      formDataObj.append('description', formData.description)
      formDataObj.append('position', formData.position)
      formDataObj.append('link', formData.link)
      if (formData.file) {
        formDataObj.append('file', formData.file)
      }

      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/advertisements', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      })

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          position: 'sidebar',
          link: '',
          file: null,
        })
        setShowForm(false)
        fetchAds()
      }
    } catch (error) {
      console.error('[v0] Failed to create ad:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchAds()
      }
    } catch (error) {
      console.error('[v0] Failed to toggle ad:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Reklamani o\'chirishni tasdiqlaysizmi?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchAds()
      }
    } catch (error) {
      console.error('[v0] Failed to delete ad:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Reklamalar</h1>
          <p className="text-gray-600 mt-2">Bannerlari va reklamalarni boshqaring</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Yangi Reklama
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reklama Sarlavhasi
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: Yangi Kursi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joylashgan Joyni
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="sidebar">Sidebar</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="modal">Modal</option>
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
                placeholder="Reklama tavsifi..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fayl (Rasm, GIF, MP4)
                </label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  accept="image/*,video/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Joʻnatilmoqda...' : 'Reklama Joylashtirish'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Reklamalar mavjud emas
          </div>
        ) : (
          ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              {ad.imageUrl && (
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{ad.title}</h3>
              {ad.description && (
                <p className="text-gray-600 text-sm mb-4">{ad.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  {ad.position}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(ad.id, ad.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      ad.isActive
                        ? 'text-blue-600 hover:bg-blue-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {ad.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
