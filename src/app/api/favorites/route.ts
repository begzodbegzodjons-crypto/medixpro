import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json([])

    const favorites = await query<any[]>(
      `SELECT f.id, f.createdAt,
              m.id AS materialId, m.title, m.description, m.fileUrl, m.type, m.price, m.isFree,
              s.id AS subjectId, s.name AS subjectName
       FROM Favorite f
       INNER JOIN Material m ON m.id = f.materialId
       LEFT JOIN Subject s ON s.id = m.subjectId
       WHERE f.userId = ?
       ORDER BY f.createdAt DESC`,
      [user.id]
    )

    return NextResponse.json(
      favorites.map((f) => ({
        id: f.id,
        createdAt: f.createdAt,
        material: {
          id: f.materialId,
          title: f.title,
          description: f.description,
          fileUrl: f.fileUrl,
          type: f.type,
          price: Number(f.price),
          isFree: Boolean(f.isFree),
          subject: { id: f.subjectId, name: f.subjectName },
        },
      }))
    )
  } catch (error) {
    console.error('[api/favorites] error:', error)
    return NextResponse.json([])
  }
}
