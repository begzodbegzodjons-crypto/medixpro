import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
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
        const t = await db.test.findUnique({
          where: { id },
          select: {
            id: true,
            subjectId: true,
            title: true,
            description: true,
            questions: true,
            correctAnswers: true,
            passingScore: true,
            timeLimit: true,
            subject: { select: { id: true, name: true } },
          },
        })
        if (!t) return null
        return {
          ...t,
          questions: JSON.parse(t.questions),
          correctAnswers: JSON.parse(t.correctAnswers),
        }
      },
      TTL.HOUR
    )

    if (!test) {
      return NextResponse.json(
        { message: 'Test topilmadi' },
        { status: 404 }
      )
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('[api/tests/[id]] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
