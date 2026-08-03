import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ message: 'Avtorizatsiya talab qilinadi' }, { status: 401 })
    }

    const { id: materialId } = await params

    const existing = await query<any[]>(
      'SELECT id FROM Favorite WHERE userId = ? AND materialId = ?',
      [user.id, materialId]
    )

    if (existing.length > 0) {
      await execute('DELETE FROM Favorite WHERE id = ?', [existing[0].id])
      return NextResponse.json({ success: true, favorited: false })
    }

    const { generateId } = await import('@/lib/db')
    const favId = generateId()
    await execute(
      'INSERT INTO Favorite (id, userId, materialId, createdAt) VALUES (?, ?, ?, NOW())',
      [favId, user.id, materialId]
    )

    return NextResponse.json({ success: true, favorited: true })
  } catch (error) {
    console.error('[api/materials/[id]/favorite] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
