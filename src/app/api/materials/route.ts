import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const subjectId = url.searchParams.get('subjectId')
    const type = url.searchParams.get('type')
    const isFree = url.searchParams.get('isFree')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    const where: any = {}
    if (subjectId) where.subjectId = subjectId
    if (type) where.type = type
    if (isFree === 'true') where.isFree = true
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [materials, total] = await Promise.all([
      db.material.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          fileUrl: true,
          type: true,
          price: true,
          isFree: true,
          createdAt: true,
          subject: { select: { id: true, name: true } },
        },
      }),
      db.material.count({ where }),
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
    console.error('[api/materials] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
