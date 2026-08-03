import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json(
        { message: 'Avtorizatsiya talab qilinadi' },
        { status: 401 }
      )
    }

    // Run all queries in parallel for speed
    const [totalTests, passedCount, sumScore, recentResults] = await Promise.all([
      db.testResult.count({ where: { userId: user.id } }),
      db.testResult.count({ where: { userId: user.id, passed: true } }),
      db.testResult.aggregate({
        where: { userId: user.id },
        _sum: { score: true },
      }),
      db.testResult.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          test: {
            select: { id: true, title: true, subject: { select: { name: true } } },
          },
        },
      }),
    ])

    const avgScore =
      totalTests > 0 ? (Number(sumScore._sum.score || 0) / totalTests).toFixed(1) : '0'

    return NextResponse.json({
      totalTests,
      passedTests: passedCount,
      failedTests: totalTests - passedCount,
      averageScore: avgScore,
      recentResults,
    })
  } catch (error) {
    console.error('[api/stats] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
