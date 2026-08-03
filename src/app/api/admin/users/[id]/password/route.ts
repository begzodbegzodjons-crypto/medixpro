import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { hashPassword } from '@/lib/auth-server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }
    const { id } = await params
    const { password } = await request.json()

    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: 'Parol hech bo\'lmaganda 6 ta belgidan iborat bo\'lishi kerak' },
        { status: 400 }
      )
    }

    const hashed = await hashPassword(password)
    await execute('UPDATE User SET password = ?, updatedAt = NOW() WHERE id = ?', [hashed, id])

    return NextResponse.json({ id, message: "Parol o'zgartirildi" })
  } catch (error) {
    console.error('[admin] user password error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
