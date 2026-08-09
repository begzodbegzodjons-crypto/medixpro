import { NextResponse } from 'next/server'
import { transaction, generateId } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'
import { invalidateCache, cacheKeys } from '@/lib/cache'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json({ message: 'Avtorizatsiya talab qilinadi' }, { status: 401 })
    const { materialId } = await request.json()
    if (!materialId) return NextResponse.json({ message: 'Material ID talab qilinadi' }, { status: 400 })

    const result = await transaction(async (conn) => {
      const [mats]: any = await conn.query('SELECT id, title, price, isFree FROM Material WHERE id = ?', [materialId])
      if (mats.length === 0) throw new Error('Material topilmadi')
      const material = mats[0]; const price = Number(material.price)
      const [existing]: any = await conn.query('SELECT id FROM Purchase WHERE userId = ? AND materialId = ?', [user.id, materialId])
      if (existing.length > 0) throw new Error('Siz allaqachun sotib olgansiz')
      if (Boolean(material.isFree) || price === 0) {
        const pId = generateId(); await conn.execute('INSERT INTO Purchase (id, userId, materialId, price, createdAt) VALUES (?, ?, ?, 0, NOW())', [pId, user.id, materialId])
        const lId = generateId(); await conn.execute('INSERT INTO Library (id, userId, materialId, createdAt) VALUES (?, ?, ?, NOW())', [lId, user.id, materialId])
        return { success: true, price: 0, title: material.title }
      }
      const [users]: any = await conn.query('SELECT coinBalance FROM User WHERE id = ?', [user.id])
      if (users.length === 0) throw new Error('Foydalanuvchi topilmadi')
      const currentBalance = Number(users[0].coinBalance)
      if (currentBalance < price) throw new Error(`COIN yetarli emas. Sizda ${currentBalance} COIN bor, kerak ${price}`)
      const balanceAfter = currentBalance - price
      await conn.execute('UPDATE User SET coinBalance = ? WHERE id = ?', [balanceAfter, user.id])
      const pId = generateId(); await conn.execute('INSERT INTO Purchase (id, userId, materialId, price, createdAt) VALUES (?, ?, ?, ?, NOW())', [pId, user.id, materialId, price])
      const lId = generateId(); await conn.execute('INSERT INTO Library (id, userId, materialId, createdAt) VALUES (?, ?, ?, NOW())', [lId, user.id, materialId])
      const tId = generateId(); await conn.execute("INSERT INTO Transaction (id, userId, type, amount, description, balanceBefore, balanceAfter, createdAt) VALUES (?, ?, 'purchase', ?, ?, ?, ?, NOW())", [tId, user.id, -price, `Sotib olindi: ${material.title}`, currentBalance, balanceAfter])
      return { success: true, price, title: material.title, balanceAfter }
    })

    invalidateCache(cacheKeys.userCoinBalance(user.id))
    return NextResponse.json(result)
  } catch (error) {
    console.error('[api/materials/purchase] error:', error)
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Server xatosi' }, { status: 400 })
  }
}
