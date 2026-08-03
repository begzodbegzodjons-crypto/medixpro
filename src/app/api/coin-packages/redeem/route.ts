import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'
import { invalidatePattern } from '@/lib/cache'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json(
        { message: 'Avtorizatsiya talab qilinadi' },
        { status: 401 }
      )
    }

    const { code } = await request.json()
    if (!code) {
      return NextResponse.json(
        { message: 'Kod talab qilinadi' },
        { status: 400 }
      )
    }

    const result = await db.$transaction(async (tx) => {
      const pkg = await tx.coinPackage.findUnique({
        where: { code: String(code).trim().toUpperCase() },
      })

      if (!pkg) throw new Error('Noto\'g\'ri kod')
      if (!pkg.isActive) throw new Error('Bu paket faol emas')

      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { coinBalance: true },
      })
      if (!currentUser) throw new Error('Foydalanuvchi topilmadi')

      const balanceBefore = currentUser.coinBalance
      const balanceAfter = balanceBefore + pkg.coins

      await tx.user.update({
        where: { id: user.id },
        data: { coinBalance: balanceAfter },
      })

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'coin_package',
          amount: pkg.coins,
          description: `COIN paketi: ${pkg.name} (${pkg.code})`,
          balanceBefore,
          balanceAfter,
        },
      })

      // Deactivate the package code (one-time use)
      await tx.coinPackage.update({
        where: { id: pkg.id },
        data: { isActive: false },
      })

      return { coins: pkg.coins, balanceAfter }
    })

    // Invalidate cached balance
    invalidatePattern(`user:coins:${user.id}`)

    return NextResponse.json({ success: true, coins: result.coins })
  } catch (error) {
    console.error('[api/coin-packages/redeem] error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Server xatosi' },
      { status: 400 }
    )
  }
}
