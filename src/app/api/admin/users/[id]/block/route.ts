import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
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

    await db.user.update({
      where: { id },
      data: { isBlocked: !!isBlocked },
    })

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
