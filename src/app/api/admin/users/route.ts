import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }
    const users = await query<any[]>(
      `SELECT id, name, email, coinBalance, isBlocked, isAdmin, createdAt
       FROM User
       ORDER BY createdAt DESC`
    )
    return NextResponse.json(
      users.map((u) => ({
        ...u,
        coinBalance: Number(u.coinBalance),
        isBlocked: Boolean(u.isBlocked),
        isAdmin: Boolean(u.isAdmin),
      }))
    )
  } catch (error) {
    console.error('[admin] users GET error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
