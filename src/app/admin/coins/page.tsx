'use client'

import AdminLayout from '@/components/admin/admin-layout'
import CoinsManager from '@/components/admin/coins-manager'
import { useAdminAuth } from '@/lib/use-admin-auth'

export default function CoinsPage() {
  const { authenticated, loading } = useAdminAuth()

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <CoinsManager />
    </AdminLayout>
  )
}
