import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json([])

    const notifications = await query<any[]>(
      `SELECT id, userId, title, message, type, isRead, link, createdAt
       FROM Notification
       WHERE userId = ?
       ORDER BY createdAt DESC
       LIMIT 20`,
      [user.id]
    )

    return NextResponse.json(
      notifications.map((n) => ({
        ...n,
        isRead: Boolean(n.isRead),
      }))
    )
  } catch (error) {
    console.error('[api/notifications] error:', error)
    return NextResponse.json([])
  }
}
