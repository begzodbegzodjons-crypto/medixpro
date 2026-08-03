import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const subjectId = url.searchParams.get('subjectId')
    const type = url.searchParams.get('type')
    const isFree = url.searchParams.get('isFree')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    const where: string[] = []
    const values: any[] = []
    if (subjectId) {
      where.push('m.subjectId = ?')
      values.push(subjectId)
    }
    if (type) {
      where.push('m.type = ?')
      values.push(type)
    }
    if (isFree === 'true') {
      where.push('m.isFree = 1')
    }
    if (search) {
      where.push('(m.title LIKE ? OR m.description LIKE ?)')
      values.push(`%${search}%`, `%${search}%`)
    }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : ''

    const [mats, totalRows] = await Promise.all([
      query<any[]>(
        `SELECT m.id, m.title, m.description, m.fileUrl, m.type, m.price, m.isFree, m.createdAt,
                s.id AS subjectId, s.name AS subjectName
         FROM Material m
         LEFT JOIN Subject s ON s.id = m.subjectId
         ${whereSql}
         ORDER BY m.createdAt DESC
         LIMIT ? OFFSET ?`,
        [...values, limit, skip]
      ),
      query<any[]>(`SELECT COUNT(*) as cnt FROM Material m ${whereSql}`, values),
    ])

    const total = Number(totalRows[0]?.cnt || 0)

    return NextResponse.json({
      items: mats.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        fileUrl: m.fileUrl,
        type: m.type,
        price: Number(m.price),
        isFree: Boolean(m.isFree),
        createdAt: m.createdAt,
        subject: { id: m.subjectId, name: m.subjectName },
      })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error('[api/materials] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
