import { NextResponse } from 'next/server'
import { transaction, generateId } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'
import { invalidateCache, cacheKeys } from '@/lib/cache'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ message: 'Avtorizatsiya talab qilinadi' }, { status: 401 })
    }

    const { code } = await request.json()
    if (!code) {
      return NextResponse.json({ message: 'Kod talab qilinadi' }, { status: 400 })
    }

    const result = await transaction(async (tx) => {
      const acRes: any = await tx.execute(
        'SELECT id, code, type, isUsed FROM AdminCode WHERE code = ?',
        [String(code).trim().toUpperCase()]
      )
      const rows = acRes.rows || acRes
      if (!rows || rows.length === 0) throw new Error('Noto\'g\'ri kod')
      const adminCode = rows[0]
      if (Boolean(adminCode.isUsed)) throw new Error('Bu kod allaqachon ishlatilgan')

      await tx.execute(
        'UPDATE AdminCode SET isUsed = 1, usedById = ?, usedAt = NOW() WHERE id = ?',
        [user.id, adminCode.id]
      )

      if (adminCode.type === 'admin') {
        await tx.execute('UPDATE User SET isAdmin = 1 WHERE id = ?', [user.id])
      }

      return { type: adminCode.type }
    })

    invalidateCache(cacheKeys.userCoinBalance(user.id))

    return NextResponse.json({ success: true, type: result.type })
  } catch (error) {
    console.error('[api/admin-codes/redeem] error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Server xatosi' },
      { status: 400 }
    )
  }
}
