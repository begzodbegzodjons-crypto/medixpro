import { NextResponse } from 'next/server'
import { query, execute, generateId } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }
    const materials = await query<any[]>(
      `SELECT m.id, m.subjectId, m.title, m.description, m.fileUrl, m.type, m.price, m.isFree, m.createdAt, m.updatedAt,
              s.id AS subjectId, s.name AS subjectName
       FROM Material m
       LEFT JOIN Subject s ON s.id = m.subjectId
       ORDER BY m.createdAt DESC`
    )
    return NextResponse.json(
      materials.map((m) => ({
        ...m,
        price: Number(m.price),
        isFree: Boolean(m.isFree),
        subject: { id: m.subjectId, name: m.subjectName },
      }))
    )
  } catch (error) {
    console.error('[admin] materials GET error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }
    const body = await request.json()
    const { subjectId, title, description, fileUrl, type, price, isFree } = body

    if (!subjectId || !title || !fileUrl || !type) {
      return NextResponse.json(
        { message: 'Fan, sarlavha, fayl URL va tur talab qilinadi' },
        { status: 400 }
      )
    }
    if (!['pdf', 'video'].includes(type)) {
      return NextResponse.json(
        { message: 'Tur faqat "pdf" yoki "video" bo\'lishi mumkin' },
        { status: 400 }
      )
    }

    const id = generateId()
    await execute(
      `INSERT INTO Material (id, subjectId, title, description, fileUrl, type, price, isFree, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, subjectId, title, description || null, fileUrl, type, Number(price) || 0, isFree ? 1 : 0]
    )

    return NextResponse.json({ id, subjectId, title, description, fileUrl, type, price: Number(price) || 0, isFree: !!isFree })
  } catch (error) {
    console.error('[admin] materials POST error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
