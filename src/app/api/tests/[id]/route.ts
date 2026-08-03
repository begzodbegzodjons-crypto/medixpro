import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getOrSet, cacheKeys, TTL } from '@/lib/cache'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const test = await getOrSet(
      cacheKeys.testById(id),
      async () => {
        const rows = await query<any[]>(
          `SELECT t.id, t.subjectId, t.title, t.description, t.questions, t.correctAnswers,
                  t.passingScore, t.timeLimit,
                  s.id AS subjectId, s.name AS subjectName
           FROM Test t
           LEFT JOIN Subject s ON s.id = t.subjectId
           WHERE t.id = ?`,
          [id]
        )
        if (rows.length === 0) return null
        const t = rows[0]
        return {
          id: t.id,
          subjectId: t.subjectId,
          title: t.title,
          description: t.description,
          questions: JSON.parse(t.questions),
          correctAnswers: JSON.parse(t.correctAnswers),
          passingScore: t.passingScore,
          timeLimit: t.timeLimit,
          subject: { id: t.subjectId, name: t.subjectName },
        }
      },
      TTL.HOUR
    )

    if (!test) {
      return NextResponse.json({ message: 'Test topilmadi' }, { status: 404 })
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('[api/tests/[id]] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
