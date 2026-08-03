import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const topicId = url.searchParams.get('topicId')
    const classLevel = url.searchParams.get('classLevel')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    const where: any = { subjectId: id, isPublic: true }
    if (topicId) where.topicId = topicId
    if (classLevel) where.classLevel = parseInt(classLevel)

    const [materials, total] = await Promise.all([
      db.lessonMaterial.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          classLevel: true,
          createdAt: true,
          topic: { select: { id: true, name: true } },
          author: { select: { id: true, name: true } },
        },
      }),
      db.lessonMaterial.count({ where }),
    ])

    return NextResponse.json({
      items: materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error('[api/subjects/[id]/lesson-materials] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
