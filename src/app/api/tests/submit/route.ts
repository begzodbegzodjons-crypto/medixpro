import { NextResponse } from 'next/server'
import { query, transaction, generateId } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'
import { invalidateCache, cacheKeys } from '@/lib/cache'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ message: 'Avtorizatsiya talab qilinadi' }, { status: 401 })
    }

    const body = await request.json()
    const { testId, answers, score, timeTaken } = body

    if (!testId || !Array.isArray(answers) || typeof score !== 'number') {
      return NextResponse.json({ message: 'Noto\'g\'ri ma\'lumot' }, { status: 400 })
    }

    const testRows: any = await query('SELECT id, title, passingScore FROM Test WHERE id = ?', [testId])
    if (!testRows || (Array.isArray(testRows) && testRows.length === 0)) {
      return NextResponse.json({ message: 'Test topilmadi' }, { status: 404 })
    }

    const test = Array.isArray(testRows) ? testRows[0] : testRows
    const passed = score >= test.passingScore
    const coinReward = passed ? 50 : 0
    const resultId = generateId()

    await transaction(async (tx) => {
      // Create test result
      await tx.execute(
        `INSERT INTO TestResult (id, userId, testId, score, passed, answers, timeTaken, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [resultId, user.id, testId, score, passed ? 1 : 0, JSON.stringify(answers), timeTaken || 0]
      )

      // Reward coins if passed
      if (passed && coinReward > 0) {
        const userRes: any = await tx.execute(
          'SELECT coinBalance, testsCompletedToday, lastTestDate FROM User WHERE id = ?',
          [user.id]
        )
        const userRows = userRes.rows || userRes
        if (!userRows || userRows.length === 0) throw new Error('Foydalanuvchi topilmadi')

        const balanceBefore = Number(userRows[0].coinBalance)
        const balanceAfter = balanceBefore + coinReward

        await tx.execute(
          'UPDATE User SET coinBalance = ? WHERE id = ?',
          [balanceAfter, user.id]
        )

        const txId = generateId()
        await tx.execute(
          `INSERT INTO Transaction (id, userId, type, amount, description, balanceBefore, balanceAfter, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [txId, user.id, 'test_reward', coinReward, `Test mukofoti: ${test.title}`, balanceBefore, balanceAfter]
        )
      }

      // Update tests completed today
      const today = new Date().toISOString().split('T')[0]
      const userRes2: any = await tx.execute(
        'SELECT testsCompletedToday, lastTestDate FROM User WHERE id = ?',
        [user.id]
      )
      const userRows2 = userRes2.rows || userRes2
      const lastTestDate = userRows2[0].lastTestDate
      const testsCompleted = lastTestDate === today
        ? (Number(userRows2[0].testsCompletedToday) || 0) + 1
        : 1

      await tx.execute(
        'UPDATE User SET testsCompletedToday = ?, lastTestDate = ? WHERE id = ?',
        [testsCompleted, today, user.id]
      )

      return { passed, coinReward }
    })

    invalidateCache(cacheKeys.userCoinBalance(user.id))

    return NextResponse.json({ passed, coinReward })
  } catch (error) {
    console.error('[api/tests/submit] error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Server xatosi' },
      { status: 500 }
    )
  }
}
