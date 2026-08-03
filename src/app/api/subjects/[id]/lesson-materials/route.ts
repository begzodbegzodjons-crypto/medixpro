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

    const where: string[] = ['lm.subjectId = ?', 'lm.isPublic = 1']
    const values: any[] = [id]
    if (topicId) {
      where.push('lm.topicId = ?')
      values.push(topicId)
    }
    if (classLevel) {
      where.push('lm.classLevel = ?')
      values.push(parseInt(classLevel))
    }
    const whereSql = where.join(' AND ')

    const [mats, totalRows] = await Promise.all([
      query<any[]>(
        `SELECT lm.id, lm.title, lm.description, lm.fileUrls, lm.type, lm.classLevel, lm.createdAt,
                s.id AS subjectId, s.name AS subjectName, s.icon AS subjectIcon,
                tp.id AS topicId, tp.name AS topicName,
                u.id AS authorId, u.name AS authorName
         FROM LessonMaterial lm
         LEFT JOIN Subject s ON s.id = lm.subjectId
         LEFT JOIN Topic tp ON tp.id = lm.topicId
         LEFT JOIN User u ON u.id = lm.authorId
         WHERE ${whereSql}
         ORDER BY lm.createdAt DESC
         LIMIT ? OFFSET ?`,
        [...values, limit, skip]
      ),
      query<any[]>(`SELECT COUNT(*) as cnt FROM LessonMaterial lm WHERE ${whereSql}`, values),
    ])

    const total = Number(totalRows[0]?.cnt || 0)

    return NextResponse.json({
      items: mats.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        fileUrls: JSON.parse(m.fileUrls),
        type: m.type,
        classLevel: m.classLevel,
        createdAt: m.createdAt,
        subject: { id: m.subjectId, name: m.subjectName, icon: m.subjectIcon },
        topic: m.topicId ? { id: m.topicId, name: m.topicName } : null,
        author: m.authorId ? { id: m.authorId, name: m.authorName } : null,
      })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error('[api/subjects/[id]/lesson-materials] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
