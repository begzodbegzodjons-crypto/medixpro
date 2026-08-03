// Quick script to check database state
import { db } from '../src/lib/db'

async function main() {
  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, coinBalance: true, isAdmin: true, isBlocked: true },
  })
  console.log('=== USERS ===')
  console.table(users)

  const transactions = await db.transaction.findMany({
    select: { id: true, userId: true, type: true, amount: true, description: true, createdAt: true },
    take: 20,
    orderBy: { createdAt: 'desc' },
  })
  console.log('=== TRANSACTIONS (recent 20) ===')
  console.table(transactions)

  const coinPackages = await db.coinPackage.findMany()
  console.log('=== COIN PACKAGES ===')
  console.table(coinPackages)

  const adminCodes = await db.adminCode.findMany()
  console.log('=== ADMIN CODES ===')
  console.table(adminCodes)

  await db.$disconnect()
}

main()
