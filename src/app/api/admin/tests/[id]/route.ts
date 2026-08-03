import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
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
    const rows = await query<any[]>(
      `SELECT t.id, t.subjectId, t.title, t.description, t.questions, t.correctAnswers, t.passingScore, t.timeLimit,
              s.id AS subjectId, s.name AS subjectName
       FROM Test t
       LEFT JOIN Subject s ON s.id = t.subjectId
       WHERE t.id = ?`,
      [id]
    )
    if (rows.length === 0) return NextResponse.json({ message: 'Test topilmadi' }, { status: 404 })
    const t = rows[0]
    return NextResponse.json({
      ...t,
      questions: JSON.parse(t.questions),
      correctAnswers: JSON.parse(t.correctAnswers),
      subject: { id: t.subjectId, name: t.subjectName },
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
    const sets: string[] = []
    const values: any[] = []
    if (body.subjectId !== undefined) { sets.push('subjectId = ?'); values.push(body.subjectId) }
    if (body.title !== undefined) { sets.push('title = ?'); values.push(body.title) }
    if (body.description !== undefined) { sets.push('description = ?'); values.push(body.description) }
    if (body.passingScore !== undefined) { sets.push('passingScore = ?'); values.push(body.passingScore) }
    if (body.timeLimit !== undefined) { sets.push('timeLimit = ?'); values.push(body.timeLimit) }
    if (body.questions !== undefined) {
      if (!Array.isArray(body.questions)) {
        return NextResponse.json({ message: 'questions massiv bo\'lishi kerak' }, { status: 400 })
      }
      sets.push('questions = ?'); values.push(JSON.stringify(body.questions))
    }
    if (body.correctAnswers !== undefined) {
      if (!Array.isArray(body.correctAnswers)) {
        return NextResponse.json({ message: 'correctAnswers massiv bo\'lishi kerak' }, { status: 400 })
      }
      sets.push('correctAnswers = ?'); values.push(JSON.stringify(body.correctAnswers))
    }
    sets.push('updatedAt = NOW()')
    values.push(id)

    await execute(`UPDATE Test SET ${sets.join(', ')} WHERE id = ?`, values)
    return NextResponse.json({ id })
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
    await execute('DELETE FROM Test WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Test o\'chirildi' })
  } catch (error) {
    console.error('[admin] test DELETE error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
