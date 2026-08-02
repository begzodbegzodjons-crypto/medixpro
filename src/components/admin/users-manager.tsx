'use client'

import { useEffect, useState } from 'react'
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  coinBalance: number
  isBlocked: boolean
  lastLogin?: string
  password?: string
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingCoins, setEditingCoins] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('[v0] Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('[v0] Failed to block user:', error)
    }
  }

  const handleUpdateCoins = async (userId: string, coins: number) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/users/${userId}/coins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coins }),
      })

      if (response.ok) {
        fetchUsers()
        setEditingCoins({})
      }
    } catch (error) {
      console.error('[v0] Failed to update coins:', error)
    }
  }

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Yangi parol kiriting:')
    if (!newPassword) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      })

      if (response.ok) {
        alert('Parol o\'zgartirildi')
        fetchUsers()
      }
    } catch (error) {
      console.error('[v0] Failed to reset password:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Foydalanuvchilar</h1>
        <p className="text-gray-600 mt-2">Foydalanuvchillarni boshqaring va bloklang</p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Foydalanuvchilar mavjud emas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Ism
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    COIN
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Parol
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Harakatlari
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editingCoins[user.id] ?? user.coinBalance}
                          onChange={(e) =>
                            setEditingCoins({
                              ...editingCoins,
                              [user.id]: parseInt(e.target.value),
                            })
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          onClick={() =>
                            handleUpdateCoins(user.id, editingCoins[user.id] ?? user.coinBalance)
                          }
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          O'zg.
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                      >
                        O'zg. Parol
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleBlock(user.id, user.isBlocked)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isBlocked
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {user.isBlocked ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </button>
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
