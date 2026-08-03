import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const rows = await query<any[]>(
      `SELECT lm.id, lm.title, lm.description, lm.fileUrls, lm.type, lm.classLevel,
              lm.createdAt, lm.updatedAt,
              s.id AS subjectId, s.name AS subjectName, s.icon AS subjectIcon,
              tp.id AS topicId, tp.name AS topicName,
              u.id AS authorId, u.name AS authorName
       FROM LessonMaterial lm
       LEFT JOIN Subject s ON s.id = lm.subjectId
       LEFT JOIN Topic tp ON tp.id = lm.topicId
       LEFT JOIN User u ON u.id = lm.authorId
       WHERE lm.id = ?`,
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Dars ishlanmasi topilmadi' }, { status: 404 })
    }

    const m = rows[0]
    return NextResponse.json({
      id: m.id,
      title: m.title,
      description: m.description,
      fileUrls: JSON.parse(m.fileUrls),
      type: m.type,
      classLevel: m.classLevel,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      subject: { id: m.subjectId, name: m.subjectName, icon: m.subjectIcon },
      topic: m.topicId ? { id: m.topicId, name: m.topicName } : null,
      author: m.authorId ? { id: m.authorId, name: m.authorName } : null,
    })
  } catch (error) {
    console.error('[api/lesson-materials/[id]] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
