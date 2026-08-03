import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrSet, cacheKeys, TTL } from '@/lib/cache'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const topics = await getOrSet(
      cacheKeys.topicsBySubject(id),
      () =>
        db.topic.findMany({
          where: { subjectId: id },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            order: true,
            _count: {
              select: {
                lessonPlans: true,
                lessonMaterials: true,
              },
            },
          },
        }),
      TTL.MEDIUM
    )

    return NextResponse.json(topics)
  } catch (error) {
    console.error('[api/subjects/[id]/topics] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
