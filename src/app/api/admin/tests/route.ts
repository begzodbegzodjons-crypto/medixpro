import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const tests = await db.test.findMany({
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tests)
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

    // questions: array of { id, text, options[] }
    // correctAnswers: array of strings (one correct option per question, same index)
    if (!Array.isArray(questions) || !Array.isArray(correctAnswers)) {
      return NextResponse.json(
        { message: 'Savollar va javoblar massiv bo\'lishi kerak' },
        { status: 400 }
      )
    }

    if (questions.length !== correctAnswers.length) {
      return NextResponse.json(
        { message: 'Savollar va javoblar soni teng bo\'lishi kerak' },
        { status: 400 }
      )
    }

    const test = await db.test.create({
      data: {
        subjectId,
        title,
        description: description || null,
        questions: JSON.stringify(questions),
        correctAnswers: JSON.stringify(correctAnswers),
        passingScore: passingScore ?? 60,
        timeLimit: timeLimit ?? null,
      },
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('[admin] tests POST error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
