import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const subjectId = url.searchParams.get('subjectId')
    const topicId = url.searchParams.get('topicId')
    const classLevel = url.searchParams.get('classLevel')
    const type = url.searchParams.get('type')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    const where: any = { isPublic: true }
    if (subjectId) where.subjectId = subjectId
    if (topicId) where.topicId = topicId
    if (classLevel) where.classLevel = parseInt(classLevel)
    if (type) where.type = type
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

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
          fileUrls: true,
          type: true,
          classLevel: true,
          createdAt: true,
          subject: { select: { id: true, name: true, icon: true } },
          topic: { select: { id: true, name: true } },
          author: { select: { id: true, name: true } },
        },
      }),
      db.lessonMaterial.count({ where }),
    ])

    return NextResponse.json({
      items: materials.map((m) => ({
        ...m,
        fileUrls: JSON.parse(m.fileUrls),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error('[api/lesson-materials] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
