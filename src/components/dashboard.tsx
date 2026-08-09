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
import LessonPlans from './lesson-plans'
import LessonMaterials from './lesson-materials'
import Favorites from './favorites'
import SearchView from './search-view'

type Tab = 'home' | 'tests' | 'marketplace' | 'library' | 'stats' | 'admin' | 'lesson-plans' | 'lesson-materials' | 'favorites' | 'search'

export default function Dashboard({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const { data: session, status } = useSession()
  const isAdmin = Boolean((session?.user as any)?.isAdmin)

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'tests': return <TestCenter />
      case 'marketplace': return <Marketplace />
      case 'library': return <Library />
      case 'stats': return <Stats />
      case 'admin': return isAdmin ? <AdminPanel /> : <SubjectGrid />
      case 'lesson-plans': return <LessonPlans />
      case 'lesson-materials': return <LessonMaterials />
      case 'favorites': return <Favorites />
      case 'search': return <SearchView />
      default: return <SubjectGrid />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} onSearch={() => setActiveTab('search')} />
      <main className="max-w-6xl mx-auto px-4 py-8">{renderContent()}</main>
    </div>
  )
}
