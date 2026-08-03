import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrSet, cacheKeys, TTL } from '@/lib/cache'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const tests = await getOrSet(
      cacheKeys.testsBySubject(id),
      () =>
        db.test.findMany({
          where: { subjectId: id },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            passingScore: true,
            timeLimit: true,
            createdAt: true,
            _count: {
              select: { testResults: true },
            },
          },
        }),
      TTL.MEDIUM
    )

    return NextResponse.json(tests)
  } catch (error) {
    console.error('[api/subjects/[id]/tests] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
