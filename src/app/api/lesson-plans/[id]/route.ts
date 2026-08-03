import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const plan = await db.lessonPlan.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        classLevel: true,
        duration: true,
        createdAt: true,
        updatedAt: true,
        subject: { select: { id: true, name: true, icon: true } },
        topic: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } },
      },
    })

    if (!plan) {
      return NextResponse.json(
        { message: 'Dars rejasi topilmadi' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...plan,
      content: JSON.parse(plan.content),
    })
  } catch (error) {
    console.error('[api/lesson-plans/[id]] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
