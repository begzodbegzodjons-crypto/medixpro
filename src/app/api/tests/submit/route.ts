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

    const body = await request.json()
    const { testId, answers, score, timeTaken } = body

    if (!testId || !Array.isArray(answers) || typeof score !== 'number') {
      return NextResponse.json(
        { message: 'Noto\'g\'ri ma\'lumot' },
        { status: 400 }
      )
    }

    const test = await db.test.findUnique({
      where: { id: testId },
      select: { id: true, title: true, passingScore: true },
    })

    if (!test) {
      return NextResponse.json(
        { message: 'Test topilmadi' },
        { status: 404 }
      )
    }

    const passed = score >= test.passingScore
    const coinReward = passed ? 50 : 0

    // Use a transaction for atomicity
    const result = await db.$transaction(async (tx) => {
      // Create test result
      await tx.testResult.create({
        data: {
          userId: user.id,
          testId,
          score,
          passed,
          answers: JSON.stringify(answers),
          timeTaken: timeTaken || 0,
        },
      })

      // Update user coin balance if passed
      if (passed && coinReward > 0) {
        const currentUser = await tx.user.findUnique({
          where: { id: user.id },
          select: { coinBalance: true, testsCompletedToday: true, lastTestDate: true },
        })
        if (!currentUser) throw new Error('Foydalanuvchi topilmadi')

        const balanceBefore = currentUser.coinBalance
        const balanceAfter = balanceBefore + coinReward

        await tx.user.update({
          where: { id: user.id },
          data: { coinBalance: balanceAfter },
        })

        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'test_reward',
            amount: coinReward,
            description: `Test mukofoti: ${test.title}`,
            balanceBefore,
            balanceAfter,
          },
        })
      }

      // Update tests completed today
      const today = new Date().toISOString().split('T')[0]
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { testsCompletedToday: true, lastTestDate: true },
      })
      const lastTestDate = currentUser?.lastTestDate
      const testsCompleted =
        lastTestDate === today ? (currentUser?.testsCompletedToday ?? 0) + 1 : 1

      await tx.user.update({
        where: { id: user.id },
        data: {
          testsCompletedToday: testsCompleted,
          lastTestDate: today,
        },
      })

      return { passed, coinReward }
    })

    // Invalidate caches
    invalidatePattern(`user:coins:${user.id}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[api/tests/submit] error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Server xatosi' },
      { status: 500 }
    )
  }
}
