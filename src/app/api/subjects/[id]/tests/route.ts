import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { TestRow } from '@/lib/db-types'
import { getOrSet, cacheKeys, TTL } from '@/lib/cache'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const tests = await getOrSet(
      cacheKeys.testsBySubject(id),
      async () => {
        const rows = await query<any[]>(
          `SELECT t.id, t.title, t.description, t.passingScore, t.timeLimit, t.createdAt,
             (SELECT COUNT(*) FROM TestResult tr WHERE tr.testId = t.id) AS resultCount
           FROM Test t
           WHERE t.subjectId = ?
           ORDER BY t.createdAt DESC`,
          [id]
        )
        return rows.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          passingScore: r.passingScore,
          timeLimit: r.timeLimit,
          createdAt: r.createdAt,
          _count: { testResults: r.resultCount },
        }))
      },
      TTL.MEDIUM
    )

    return NextResponse.json(tests)
  } catch (error) {
    console.error('[api/subjects/[id]/tests] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
