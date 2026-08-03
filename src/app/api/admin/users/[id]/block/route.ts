import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }
    const { id } = await params
    const { isBlocked } = await request.json()
    await execute('UPDATE User SET isBlocked = ?, updatedAt = NOW() WHERE id = ?', [isBlocked ? 1 : 0, id])

    return NextResponse.json({
      id,
      isBlocked: !!isBlocked,
      message: isBlocked ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi blokdan chiqarildi',
    })
  } catch (error) {
    console.error('[admin] user block error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
