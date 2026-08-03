import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') || '').trim()
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 20)

    if (q.length < 2) {
      return NextResponse.json({ materials: [], lessonPlans: [], lessonMaterials: [], tests: [], total: 0 })
    }
    const like = `%${q}%`

    const [materials, lessonPlans, lessonMaterials, tests] = await Promise.all([
      query<any[]>(
        `SELECT m.id, m.title, m.description, m.type, m.price, m.isFree,
                s.id AS subjectId, s.name AS subjectName, s.icon AS subjectIcon
         FROM Material m
         LEFT JOIN Subject s ON s.id = m.subjectId
         WHERE m.title LIKE ? OR m.description LIKE ?
         ORDER BY m.createdAt DESC LIMIT ?`,
        [like, like, limit]
      ),
      query<any[]>(
        `SELECT lp.id, lp.title, lp.description, lp.classLevel,
                s.id AS subjectId, s.name AS subjectName, s.icon AS subjectIcon
         FROM LessonPlan lp
         LEFT JOIN Subject s ON s.id = lp.subjectId
         WHERE lp.isPublic = 1 AND (lp.title LIKE ? OR lp.description LIKE ?)
         ORDER BY lp.createdAt DESC LIMIT ?`,
        [like, like, limit]
      ),
      query<any[]>(
        `SELECT lm.id, lm.title, lm.description, lm.type, lm.classLevel,
                s.id AS subjectId, s.name AS subjectName, s.icon AS subjectIcon
         FROM LessonMaterial lm
         LEFT JOIN Subject s ON s.id = lm.subjectId
         WHERE lm.isPublic = 1 AND (lm.title LIKE ? OR lm.description LIKE ?)
         ORDER BY lm.createdAt DESC LIMIT ?`,
        [like, like, limit]
      ),
      query<any[]>(
        `SELECT t.id, t.title, t.description, t.passingScore,
                s.id AS subjectId, s.name AS subjectName, s.icon AS subjectIcon
         FROM Test t
         LEFT JOIN Subject s ON s.id = t.subjectId
         WHERE t.title LIKE ? OR t.description LIKE ?
         ORDER BY t.createdAt DESC LIMIT ?`,
        [like, like, limit]
      ),
    ])

    return NextResponse.json({
      materials: materials.map((m) => ({
        id: m.id, title: m.title, description: m.description, type: m.type,
        price: Number(m.price), isFree: Boolean(m.isFree),
        subject: { id: m.subjectId, name: m.subjectName, icon: m.subjectIcon },
      })),
      lessonPlans: lessonPlans.map((p) => ({
        id: p.id, title: p.title, description: p.description, classLevel: p.classLevel,
        subject: { id: p.subjectId, name: p.subjectName, icon: p.subjectIcon },
      })),
      lessonMaterials: lessonMaterials.map((m) => ({
        id: m.id, title: m.title, description: m.description, type: m.type, classLevel: m.classLevel,
        subject: { id: m.subjectId, name: m.subjectName, icon: m.subjectIcon },
      })),
      tests: tests.map((t) => ({
        id: t.id, title: t.title, description: t.description, passingScore: t.passingScore,
        subject: { id: t.subjectId, name: t.subjectName, icon: t.subjectIcon },
      })),
      total: materials.length + lessonPlans.length + lessonMaterials.length + tests.length,
    })
  } catch (error) {
    console.error('[api/search] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
