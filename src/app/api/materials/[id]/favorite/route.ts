import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json(
        { message: 'Avtorizatsiya talab qilinadi' },
        { status: 401 }
      )
    }

    const { id: materialId } = await params

    // Check if already favorited
    const existing = await db.favorite.findUnique({
      where: {
        userId_materialId: { userId: user.id, materialId },
      },
    })

    if (existing) {
      // Unfavorite
      await db.favorite.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({ success: true, favorited: false })
    }

    // Add to favorites
    await db.favorite.create({
      data: {
        userId: user.id,
        materialId,
      },
    })

    return NextResponse.json({ success: true, favorited: true })
  } catch (error) {
    console.error('[api/materials/[id]/favorite] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
