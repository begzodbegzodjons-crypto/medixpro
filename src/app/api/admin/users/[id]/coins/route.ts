import { NextResponse } from 'next/server'
import { query, execute, transaction, generateId } from '@/lib/db'
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
      return NextResponse.json({ message: 'COIN miqdori noto\'g\'ri' }, { status: 400 })
    }

    await transaction(async (conn) => {
      const [rows]: any = await conn.query('SELECT coinBalance FROM User WHERE id = ?', [id])
      if (rows.length === 0) throw new Error('Foydalanuvchi topilmadi')

      const balanceBefore = Number(rows[0].coinBalance)
      const balanceAfter = coins
      await conn.execute('UPDATE User SET coinBalance = ? WHERE id = ?', [coins, id])

      const tId = generateId()
      await conn.execute(
        `INSERT INTO Transaction (id, userId, type, amount, description, balanceBefore, balanceAfter, createdAt)
         VALUES (?, ?, 'admin_adjustment', ?, ?, ?, ?, NOW())`,
        [tId, id, balanceAfter - balanceBefore, 'Admin tomonidan balans tahrirlandi', balanceBefore, balanceAfter]
      )
    })

    return NextResponse.json({ id, coins, message: 'COIN balans yangilandi' })
  } catch (error) {
    console.error('[admin] user coins error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
