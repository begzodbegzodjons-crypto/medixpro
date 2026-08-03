import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json(
        { message: 'Avtorizatsiya talab qilinadi' },
        { status: 401 }
      )
    }

    const items = await db.library.findMany({
      where: { userId: user.id },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            description: true,
            fileUrl: true,
            type: true,
            price: true,
            subject: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      items.map((item) => ({
        id: item.id,
        material: item.material,
        purchasedAt: item.createdAt,
      }))
    )
  } catch (error) {
    console.error('[api/library] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
