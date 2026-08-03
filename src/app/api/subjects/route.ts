import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrSet, cacheKeys, TTL } from '@/lib/cache'

export async function GET() {
  try {
    const subjects = await getOrSet(
      cacheKeys.subjects,
      () =>
        db.subject.findMany({
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            icon: true,
            order: true,
            _count: {
              select: {
                tests: true,
                materials: true,
                topics: true,
              },
            },
          },
        }),
      TTL.LONG
    )

    return NextResponse.json(subjects)
  } catch (error) {
    console.error('[api/subjects] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
