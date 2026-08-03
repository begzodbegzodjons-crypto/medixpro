import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const [totalUsers, totalSubjects, totalTests, totalMaterials, activeCoinPackages] =
      await Promise.all([
        db.user.count(),
        db.subject.count(),
        db.test.count(),
        db.material.count(),
        db.coinPackage.count({ where: { isActive: true } }),
      ])

    return NextResponse.json({
      totalUsers,
      totalSubjects,
      totalTests,
      totalMaterials,
      activeCoinPackages,
    })
  } catch (error) {
    console.error('[admin] stats error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
