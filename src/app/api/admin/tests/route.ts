import { NextResponse } from 'next/server'
import { query, execute, generateId } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }
    const tests = await query<any[]>(
      `SELECT t.id, t.subjectId, t.title, t.description, t.passingScore, t.timeLimit, t.createdAt, t.updatedAt,
              s.id AS subjectId, s.name AS subjectName
       FROM Test t
       LEFT JOIN Subject s ON s.id = t.subjectId
       ORDER BY t.createdAt DESC`
    )
    return NextResponse.json(
      tests.map((t) => ({
        ...t,
        subject: { id: t.subjectId, name: t.subjectName },
      }))
    )
  } catch (error) {
    console.error('[admin] tests GET error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }
    const body = await request.json()
    const { subjectId, title, description, questions, correctAnswers, passingScore, timeLimit } = body

    if (!subjectId || !title || !questions || !correctAnswers) {
      return NextResponse.json(
        { message: 'Fan, sarlavha, savollar va to\'g\'ri javoblar talab qilinadi' },
        { status: 400 }
      )
    }
    if (!Array.isArray(questions) || !Array.isArray(correctAnswers)) {
      return NextResponse.json({ message: 'Savollar va javoblar massiv bo\'lishi kerak' }, { status: 400 })
    }
    if (questions.length !== correctAnswers.length) {
      return NextResponse.json({ message: 'Savollar va javoblar soni teng bo\'lishi kerak' }, { status: 400 })
    }

    const id = generateId()
    await execute(
      `INSERT INTO Test (id, subjectId, title, description, questions, correctAnswers, passingScore, timeLimit, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, subjectId, title, description || null, JSON.stringify(questions), JSON.stringify(correctAnswers), passingScore ?? 60, timeLimit ?? null]
    )

    return NextResponse.json({ id, subjectId, title, description, questions, correctAnswers, passingScore: passingScore ?? 60, timeLimit: timeLimit ?? null })
  } catch (error) {
    console.error('[admin] tests POST error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
