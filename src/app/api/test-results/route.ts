import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ message: 'Avtorizatsiya talab qilinadi' }, { status: 401 })
    }

    const results = await query<any[]>(
      `SELECT tr.id, tr.score, tr.passed, tr.timeTaken, tr.createdAt,
              t.id AS testId, t.title AS testTitle,
              s.id AS subjectId, s.name AS subjectName
       FROM TestResult tr
       LEFT JOIN Test t ON t.id = tr.testId
       LEFT JOIN Subject s ON s.id = t.subjectId
       WHERE tr.userId = ?
       ORDER BY tr.createdAt DESC
       LIMIT 20`,
      [user.id]
    )

    return NextResponse.json(
      results.map((r) => ({
        id: r.id,
        score: Number(r.score),
        passed: Boolean(r.passed),
        timeTaken: r.timeTaken,
        createdAt: r.createdAt,
        test: {
          id: r.testId,
          title: r.testTitle,
          subject: { id: r.subjectId, name: r.subjectName },
        },
      }))
    )
  } catch (error) {
    console.error('[api/test-results] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
