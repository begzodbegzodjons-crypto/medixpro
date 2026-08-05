import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rows = await query<any[]>(`SELECT t.id, t.title, t.testType, t.htmlContent, t.questions, t.correctAnswers, t.passingScore, t.timeLimit, s.name AS subjectName FROM Test t LEFT JOIN Subject s ON s.id = t.subjectId WHERE t.id = ?`, [id])
    if (rows.length === 0) return NextResponse.json({ message: 'Test topilmadi' }, { status: 404 })
    const test = rows[0]
    const testType = test.testType || 'multiple-choice'
    if (testType === 'html') {
      return new NextResponse(test.htmlContent || '<p>HTML kontent topilmadi</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Frame-Options': 'SAMEORIGIN', 'Content-Security-Policy': "frame-ancestors 'self'" } })
    }
    return NextResponse.json({
      id: test.id, title: test.title, testType: 'multiple-choice',
      questions: JSON.parse(test.questions || '[]'), correctAnswers: JSON.parse(test.correctAnswers || '[]'),
      passingScore: test.passingScore, timeLimit: test.timeLimit, subject: { name: test.subjectName },
    })
  } catch (error) {
    console.error('[api/tests/[id]/render] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
