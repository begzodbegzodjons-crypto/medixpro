'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from './navbar'
import SubjectGrid from './subject-grid'
import TestCenter from './test-center'
import Marketplace from './marketplace'
import Library from './library'
import Stats from './stats'
import AdminPanel from './admin-panel'

type Tab = 'home' | 'tests' | 'marketplace' | 'library' | 'stats' | 'admin'

export default function Dashboard({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const { data: session, status } = useSession()

  const isAdmin = Boolean((session?.user as any)?.isAdmin)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'tests':
        return <TestCenter />
      case 'marketplace':
        return <Marketplace />
      case 'library':
        return <Library />
      case 'stats':
        return <Stats />
      case 'admin':
        return isAdmin ? <AdminPanel /> : <SubjectGrid />
      default:
        return <SubjectGrid />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  )
}
