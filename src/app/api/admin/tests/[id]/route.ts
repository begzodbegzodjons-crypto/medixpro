import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const { id } = await params
    const test = await db.test.findUnique({
      where: { id },
      include: { subject: true },
    })

    if (!test) {
      return NextResponse.json({ message: 'Test topilmadi' }, { status: 404 })
    }

    return NextResponse.json({
      ...test,
      questions: JSON.parse(test.questions),
      correctAnswers: JSON.parse(test.correctAnswers),
    })
  } catch (error) {
    console.error('[admin] test GET error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { subjectId, title, description, questions, correctAnswers, passingScore, timeLimit } = body

    const data: any = {}
    if (subjectId !== undefined) data.subjectId = subjectId
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (passingScore !== undefined) data.passingScore = passingScore
    if (timeLimit !== undefined) data.timeLimit = timeLimit
    if (questions !== undefined) {
      if (!Array.isArray(questions)) {
        return NextResponse.json({ message: 'questions massiv bo\'lishi kerak' }, { status: 400 })
      }
      data.questions = JSON.stringify(questions)
    }
    if (correctAnswers !== undefined) {
      if (!Array.isArray(correctAnswers)) {
        return NextResponse.json({ message: 'correctAnswers massiv bo\'lishi kerak' }, { status: 400 })
      }
      data.correctAnswers = JSON.stringify(correctAnswers)
    }

    const test = await db.test.update({ where: { id }, data })

    return NextResponse.json(test)
  } catch (error) {
    console.error('[admin] test PUT error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const { id } = await params

    await db.test.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Test o\'chirildi' })
  } catch (error) {
    console.error('[admin] test DELETE error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
