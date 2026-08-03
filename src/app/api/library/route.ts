import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ message: 'Avtorizatsiya talab qilinadi' }, { status: 401 })
    }

    const items = await query<any[]>(
      `SELECT l.id, l.createdAt AS purchasedAt,
              m.id AS materialId, m.title, m.description, m.fileUrl, m.type, m.price, m.isFree,
              s.id AS subjectId, s.name AS subjectName
       FROM Library l
       INNER JOIN Material m ON m.id = l.materialId
       LEFT JOIN Subject s ON s.id = m.subjectId
       WHERE l.userId = ?
       ORDER BY l.createdAt DESC`,
      [user.id]
    )

    return NextResponse.json(
      items.map((item) => ({
        id: item.id,
        material: {
          id: item.materialId,
          title: item.title,
          description: item.description,
          fileUrl: item.fileUrl,
          type: item.type,
          price: Number(item.price),
          isFree: Boolean(item.isFree),
          subject: { id: item.subjectId, name: item.subjectName },
        },
        purchasedAt: item.purchasedAt,
      }))
    )
  } catch (error) {
    console.error('[api/library] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
