import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const [users, subjects, tests, materials, packages] = await Promise.all([
      query<any[]>('SELECT COUNT(*) as cnt FROM User'),
      query<any[]>('SELECT COUNT(*) as cnt FROM Subject'),
      query<any[]>('SELECT COUNT(*) as cnt FROM Test'),
      query<any[]>('SELECT COUNT(*) as cnt FROM Material'),
      query<any[]>('SELECT COUNT(*) as cnt FROM CoinPackage WHERE isActive = 1'),
    ])

    return NextResponse.json({
      totalUsers: Number(users[0]?.cnt || 0),
      totalSubjects: Number(subjects[0]?.cnt || 0),
      totalTests: Number(tests[0]?.cnt || 0),
      totalMaterials: Number(materials[0]?.cnt || 0),
      activeCoinPackages: Number(packages[0]?.cnt || 0),
    })
  } catch (error) {
    console.error('[admin] stats error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
