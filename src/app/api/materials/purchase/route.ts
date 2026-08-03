import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, updateUserCoins } from '@/lib/auth-server'
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

    const { materialId } = await request.json()
    if (!materialId) {
      return NextResponse.json(
        { message: 'Material ID talab qilinadi' },
        { status: 400 }
      )
    }

    // Atomic transaction: check + deduct + record + add to library
    const result = await db.$transaction(async (tx) => {
      const material = await tx.material.findUnique({
        where: { id: materialId },
      })
      if (!material) throw new Error('Material topilmadi')

      // Check if already purchased
      const existing = await tx.purchase.findUnique({
        where: {
          userId_materialId: { userId: user.id, materialId },
        },
      })
      if (existing) throw new Error('Siz allaqachon sotib olgansiz')

      // Free materials can be "purchased" without COIN
      if (material.isFree || material.price === 0) {
        await tx.purchase.create({
          data: {
            userId: user.id,
            materialId,
            price: 0,
          },
        })
        await tx.library.create({
          data: {
            userId: user.id,
            materialId,
          },
        })
        return { success: true, price: 0, title: material.title }
      }

      // Check balance
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { coinBalance: true },
      })
      if (!currentUser) throw new Error('Foydalanuvchi topilmadi')

      const currentBalance = currentUser.coinBalance
      if (currentBalance < material.price) {
        throw new Error(
          `COIN yetarli emas. Sizda ${currentBalance} COIN bor, kerak ${material.price}`
        )
      }

      const balanceAfter = currentBalance - material.price

      // Deduct coins
      await tx.user.update({
        where: { id: user.id },
        data: { coinBalance: balanceAfter },
      })

      // Record purchase
      await tx.purchase.create({
        data: {
          userId: user.id,
          materialId,
          price: material.price,
        },
      })

      // Add to library
      await tx.library.create({
        data: {
          userId: user.id,
          materialId,
        },
      })

      // Record transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'purchase',
          amount: -material.price,
          description: `Sotib olindi: ${material.title}`,
          balanceBefore: currentBalance,
          balanceAfter,
        },
      })

      return { success: true, price: material.price, title: material.title, balanceAfter }
    })

    // Invalidate user coin balance cache
    invalidatePattern(`user:coins:${user.id}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[api/materials/purchase] error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Server xatosi' },
      { status: 400 }
    )
  }
}
