'use server'

import { db } from '@/lib/db'
import { getCurrentUser, requireUser } from '@/lib/auth-server'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

// ===================== SUBJECTS =====================

export async function getSubjects() {
  return db.subject.findMany({
    orderBy: { order: 'asc' },
  })
}

// ===================== TESTS =====================

export async function getTestsBySubject(subjectId: string) {
  return db.test.findMany({
    where: { subjectId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getTestById(testId: string) {
  const test = await db.test.findUnique({ where: { id: testId } })
  if (!test) return null
  return {
    ...test,
    questions: JSON.parse(test.questions),
    correctAnswers: JSON.parse(test.correctAnswers),
  }
}

// ===================== TEST RESULTS =====================

export async function submitTestResult(
  testId: string,
  answers: string[],
  score: number,
  timeTaken: number
) {
  const user = await requireUser()

  const test = await db.test.findUnique({ where: { id: testId } })
  if (!test) throw new Error('Test topilmadi')

  const passed = score >= test.passingScore
  const coinReward = passed ? 50 : 0

  // Create test result
  await db.testResult.create({
    data: {
      userId: user.id,
      testId,
      score,
      passed,
      answers: JSON.stringify(answers),
      timeTaken,
    },
  })

  // Update user coin balance if passed
  if (passed) {
    const currentUser = await db.user.findUnique({ where: { id: user.id } })
    const balanceBefore = currentUser?.coinBalance ?? 0
    const balanceAfter = balanceBefore + coinReward

    await db.user.update({
      where: { id: user.id },
      data: { coinBalance: balanceAfter },
    })

    await db.transaction.create({
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
  const currentUser = await db.user.findUnique({ where: { id: user.id } })
  const lastTestDate = currentUser?.lastTestDate
  const testsCompleted =
    lastTestDate === today ? (currentUser?.testsCompletedToday ?? 0) + 1 : 1

  await db.user.update({
    where: { id: user.id },
    data: {
      testsCompletedToday: testsCompleted,
      lastTestDate: today,
    },
  })

  revalidatePath('/')
  return { passed, coinReward }
}

export async function getTestResults() {
  const user = await requireUser()
  return db.testResult.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { test: true },
  })
}

// ===================== MATERIALS & MARKETPLACE =====================

export async function getMaterials(subjectId?: string) {
  if (subjectId) {
    return db.material.findMany({
      where: { subjectId },
      orderBy: { createdAt: 'desc' },
    })
  }
  return db.material.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function purchaseMaterial(materialId: string) {
  const user = await requireUser()

  const material = await db.material.findUnique({ where: { id: materialId } })
  if (!material) throw new Error('Material topilmadi')

  // Check if already purchased
  const existing = await db.purchase.findUnique({
    where: {
      userId_materialId: { userId: user.id, materialId },
    },
  })
  if (existing) throw new Error('Siz allaqachon sotib olgansiz')

  const price = material.price

  // Get current user balance
  const currentUser = await db.user.findUnique({ where: { id: user.id } })
  if (!currentUser) throw new Error('Foydalanuvchi topilmadi')

  const currentBalance = currentUser.coinBalance
  if (currentBalance < price) {
    throw new Error(`COIN yetarli emas. Sizda ${currentBalance} COIN bor, kerak ${price}`)
  }

  // Deduct coins (transaction-safe)
  const balanceAfter = currentBalance - price

  await db.user.update({
    where: { id: user.id },
    data: { coinBalance: balanceAfter },
  })

  // Record purchase
  await db.purchase.create({
    data: {
      userId: user.id,
      materialId,
      price,
    },
  })

  // Add to library
  await db.library.create({
    data: {
      userId: user.id,
      materialId,
    },
  })

  // Record transaction
  await db.transaction.create({
    data: {
      userId: user.id,
      type: 'purchase',
      amount: -price,
      description: `Sotib olindi: ${material.title}`,
      balanceBefore: currentBalance,
      balanceAfter,
    },
  })

  revalidatePath('/')
  return { success: true }
}

export async function getLibrary() {
  const user = await requireUser()
  const items = await db.library.findMany({
    where: { userId: user.id },
    include: { material: true },
    orderBy: { createdAt: 'desc' },
  })
  return items.map((item) => ({
    id: item.id,
    material: item.material,
    purchasedAt: item.createdAt,
  }))
}

// ===================== USER DATA =====================

export async function getUserData() {
  const user = await requireUser()
  return db.user.findUnique({ where: { id: user.id } })
}

// ===================== STATS =====================

export async function getStats() {
  const user = await requireUser()

  const totalTests = await db.testResult.findMany({
    where: { userId: user.id },
  })

  const passedTests = totalTests.filter((r) => r.passed).length
  const avgScore =
    totalTests.length > 0
      ? (
          totalTests.reduce((sum, r) => sum + (r.score || 0), 0) /
          totalTests.length
        ).toFixed(1)
      : '0'

  return {
    totalTests: totalTests.length,
    passedTests,
    failedTests: totalTests.length - passedTests,
    averageScore: avgScore,
  }
}

// ===================== ADMIN CODES =====================

export async function redeemAdminCode(code: string) {
  const user = await requireUser()

  const adminCode = await db.adminCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  })

  if (!adminCode) throw new Error('Noto\'g\'ri kod')
  if (adminCode.isUsed) throw new Error('Bu kod allaqachon ishlatilgan')

  // Update code as used
  await db.adminCode.update({
    where: { id: adminCode.id },
    data: {
      isUsed: true,
      usedById: user.id,
      usedAt: new Date(),
    },
  })

  // Grant permissions based on code type
  if (adminCode.type === 'admin') {
    await db.user.update({
      where: { id: user.id },
      data: { isAdmin: true },
    })
  }

  revalidatePath('/')
  return { success: true, type: adminCode.type }
}

// ===================== COIN PACKAGES (user redeem) =====================

export async function redeemCoinPackage(code: string) {
  const user = await requireUser()

  const pkg = await db.coinPackage.findUnique({
    where: { code: code.trim().toUpperCase() },
  })

  if (!pkg) throw new Error('Noto\'g\'ri kod')
  if (!pkg.isActive) throw new Error('Bu paket faol emas')

  // Add coins to user balance
  const currentUser = await db.user.findUnique({ where: { id: user.id } })
  if (!currentUser) throw new Error('Foydalanuvchi topilmadi')

  const balanceBefore = currentUser.coinBalance
  const balanceAfter = balanceBefore + pkg.coins

  await db.user.update({
    where: { id: user.id },
    data: { coinBalance: balanceAfter },
  })

  await db.transaction.create({
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
  await db.coinPackage.update({
    where: { id: pkg.id },
    data: { isActive: false },
  })

  revalidatePath('/')
  return { success: true, coins: pkg.coins }
}
