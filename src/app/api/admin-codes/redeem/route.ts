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
      const adminCode = await tx.adminCode.findUnique({
        where: { code: String(code).trim().toUpperCase() },
      })

      if (!adminCode) throw new Error('Noto\'g\'ri kod')
      if (adminCode.isUsed) throw new Error('Bu kod allaqachon ishlatilgan')

      // Update code as used
      await tx.adminCode.update({
        where: { id: adminCode.id },
        data: {
          isUsed: true,
          usedById: user.id,
          usedAt: new Date(),
        },
      })

      // Grant permissions based on code type
      if (adminCode.type === 'admin') {
        await tx.user.update({
          where: { id: user.id },
          data: { isAdmin: true },
        })
      }

      return { type: adminCode.type }
    })

    // Invalidate cached balance and user data
    invalidatePattern(`user:coins:${user.id}`)

    return NextResponse.json({ success: true, type: result.type })
  } catch (error) {
    console.error('[api/admin-codes/redeem] error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Server xatosi' },
      { status: 400 }
    )
  }
}
