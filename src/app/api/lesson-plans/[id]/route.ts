import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const rows = await query<any[]>(
      `SELECT lp.id, lp.title, lp.description, lp.content, lp.classLevel, lp.duration,
              lp.createdAt, lp.updatedAt,
              s.id AS subjectId, s.name AS subjectName, s.icon AS subjectIcon,
              tp.id AS topicId, tp.name AS topicName,
              u.id AS authorId, u.name AS authorName
       FROM LessonPlan lp
       LEFT JOIN Subject s ON s.id = lp.subjectId
       LEFT JOIN Topic tp ON tp.id = lp.topicId
       LEFT JOIN User u ON u.id = lp.authorId
       WHERE lp.id = ?`,
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Dars rejasi topilmadi' }, { status: 404 })
    }

    const p = rows[0]
    return NextResponse.json({
      id: p.id,
      title: p.title,
      description: p.description,
      content: JSON.parse(p.content),
      classLevel: p.classLevel,
      duration: p.duration,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      subject: { id: p.subjectId, name: p.subjectName, icon: p.subjectIcon },
      topic: p.topicId ? { id: p.topicId, name: p.topicName } : null,
      author: p.authorId ? { id: p.authorId, name: p.authorName } : null,
    })
  } catch (error) {
    console.error('[api/lesson-plans/[id]] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
