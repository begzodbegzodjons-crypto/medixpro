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

    const result = await transaction(async (conn) => {
      const [rows]: any = await conn.query(
        'SELECT id, name, coins, code, isActive FROM CoinPackage WHERE code = ?',
        [String(code).trim().toUpperCase()]
      )
      if (rows.length === 0) throw new Error('Noto\'g\'ri kod')
      const pkg = rows[0]
      if (!Boolean(pkg.isActive)) throw new Error('Bu paket faol emas')

      const [users]: any = await conn.query('SELECT coinBalance FROM User WHERE id = ?', [user.id])
      if (users.length === 0) throw new Error('Foydalanuvchi topilmadi')
      const balanceBefore = Number(users[0].coinBalance)
      const balanceAfter = balanceBefore + Number(pkg.coins)

      await conn.execute('UPDATE User SET coinBalance = ? WHERE id = ?', [balanceAfter, user.id])

      const tId = generateId()
      await conn.execute(
        `INSERT INTO Transaction (id, userId, type, amount, description, balanceBefore, balanceAfter, createdAt)
         VALUES (?, ?, 'coin_package', ?, ?, ?, ?, NOW())`,
        [tId, user.id, Number(pkg.coins), `COIN paketi: ${pkg.name} (${pkg.code})`, balanceBefore, balanceAfter]
      )

      await conn.execute('UPDATE CoinPackage SET isActive = 0 WHERE id = ?', [pkg.id])

      return { coins: Number(pkg.coins), balanceAfter }
    })

    invalidateCache(cacheKeys.userCoinBalance(user.id))

    return NextResponse.json({ success: true, coins: result.coins })
  } catch (error) {
    console.error('[api/coin-packages/redeem] error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Server xatosi' },
      { status: 400 }
    )
  }
}
