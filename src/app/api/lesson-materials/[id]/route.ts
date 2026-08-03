import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const material = await db.lessonMaterial.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrls: true,
        type: true,
        classLevel: true,
        createdAt: true,
        updatedAt: true,
        subject: { select: { id: true, name: true, icon: true } },
        topic: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } },
      },
    })

    if (!material) {
      return NextResponse.json(
        { message: 'Dars ishlanmasi topilmadi' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...material,
      fileUrls: JSON.parse(material.fileUrls),
    })
  } catch (error) {
    console.error('[api/lesson-materials/[id]] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
