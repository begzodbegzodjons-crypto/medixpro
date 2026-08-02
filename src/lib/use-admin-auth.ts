'use client'

import { useEffect, useState } from 'react'

/**
 * Hook that ensures the user is authenticated as admin.
 * Redirects to /?adminkod=access if not.
 */
export function useAdminAuth() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      window.location.href = '/admin-access?adminkod=access'
      return
    }

    fetch('/api/admin/verify-token', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true)
        } else {
          localStorage.removeItem('adminToken')
          window.location.href = '/admin-access?adminkod=access'
        }
      })
      .catch(() => {
        window.location.href = '/admin-access?adminkod=access'
      })
      .finally(() => setLoading(false))
  }, [])

  return { authenticated, loading }
}
