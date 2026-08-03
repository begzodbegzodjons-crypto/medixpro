import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { SubjectRow } from '@/lib/db-types'
import { getOrSet, cacheKeys, TTL } from '@/lib/cache'

export async function GET() {
  try {
    const subjects = await getOrSet(
      cacheKeys.subjects,
      async () => {
        const rows = await query<SubjectRow[]>(
          `SELECT s.*,
             (SELECT COUNT(*) FROM Test t WHERE t.subjectId = s.id) AS testCount,
             (SELECT COUNT(*) FROM Material m WHERE m.subjectId = s.id) AS materialCount,
             (SELECT COUNT(*) FROM Topic tp WHERE tp.subjectId = s.id) AS topicCount
           FROM Subject s
           ORDER BY s.\`order\` ASC`
        )
        return rows.map((r) => ({
          id: r.id,
          name: r.name,
          icon: r.icon,
          order: r.order,
          _count: {
            tests: (r as any).testCount,
            materials: (r as any).materialCount,
            topics: (r as any).topicCount,
          },
        }))
      },
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
