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
    const { coins } = await request.json()

    if (typeof coins !== 'number' || coins < 0) {
      return NextResponse.json(
        { message: 'COIN miqdori noto\'g\'ri' },
        { status: 400 }
      )
    }

    const currentUser = await db.user.findUnique({ where: { id } })
    if (!currentUser) {
      return NextResponse.json({ message: 'Foydalanuvchi topilmadi' }, { status: 404 })
    }

    const balanceBefore = currentUser.coinBalance
    const balanceAfter = coins

    await db.user.update({
      where: { id },
      data: { coinBalance: coins },
    })

    await db.transaction.create({
      data: {
        userId: id,
        type: 'admin_adjustment',
        amount: balanceAfter - balanceBefore,
        description: `Admin tomonidan balans tahrirlandi`,
        balanceBefore,
        balanceAfter,
      },
    })

    return NextResponse.json({
      id,
      coins,
      message: 'COIN balans yangilandi',
    })
  } catch (error) {
    console.error('[admin] user coins error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
