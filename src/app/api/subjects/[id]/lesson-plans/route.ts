import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

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

    const where: string[] = ['lp.subjectId = ?', 'lp.isPublic = 1']
    const values: any[] = [id]
    if (topicId) {
      where.push('lp.topicId = ?')
      values.push(topicId)
    }
    if (classLevel) {
      where.push('lp.classLevel = ?')
      values.push(parseInt(classLevel))
    }
    const whereSql = where.join(' AND ')

    const [plans, totalRows] = await Promise.all([
      query<any[]>(
        `SELECT lp.id, lp.title, lp.description, lp.classLevel, lp.duration, lp.createdAt,
                s.id AS subjectId, s.name AS subjectName, s.icon AS subjectIcon,
                tp.id AS topicId, tp.name AS topicName,
                u.id AS authorId, u.name AS authorName
         FROM LessonPlan lp
         LEFT JOIN Subject s ON s.id = lp.subjectId
         LEFT JOIN Topic tp ON tp.id = lp.topicId
         LEFT JOIN User u ON u.id = lp.authorId
         WHERE ${whereSql}
         ORDER BY lp.createdAt DESC
         LIMIT ? OFFSET ?`,
        [...values, limit, skip]
      ),
      query<any[]>(`SELECT COUNT(*) as cnt FROM LessonPlan lp WHERE ${whereSql}`, values),
    ])

    const total = Number(totalRows[0]?.cnt || 0)

    return NextResponse.json({
      items: plans.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        classLevel: p.classLevel,
        duration: p.duration,
        createdAt: p.createdAt,
        subject: { id: p.subjectId, name: p.subjectName, icon: p.subjectIcon },
        topic: p.topicId ? { id: p.topicId, name: p.topicName } : null,
        author: p.authorId ? { id: p.authorId, name: p.authorName } : null,
      })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error('[api/subjects/[id]/lesson-plans] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
