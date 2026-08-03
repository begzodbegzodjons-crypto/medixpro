import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getOrSet, cacheKeys, TTL } from '@/lib/cache'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const topics = await getOrSet(
      cacheKeys.topicsBySubject(id),
      async () => {
        const rows = await query<any[]>(
          `SELECT tp.id, tp.name, tp.description, tp.\`order\`,
             (SELECT COUNT(*) FROM LessonPlan lp WHERE lp.topicId = tp.id) AS lessonPlanCount,
             (SELECT COUNT(*) FROM LessonMaterial lm WHERE lm.topicId = tp.id) AS lessonMaterialCount
           FROM Topic tp
           WHERE tp.subjectId = ?
           ORDER BY tp.\`order\` ASC`,
          [id]
        )
        return rows.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          order: r.order,
          _count: {
            lessonPlans: r.lessonPlanCount,
            lessonMaterials: r.lessonMaterialCount,
          },
        }))
      },
      TTL.MEDIUM
    )

    return NextResponse.json(topics)
  } catch (error) {
    console.error('[api/subjects/[id]/topics] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
