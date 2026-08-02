import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const { id } = await params
    const { name, icon } = await request.json()

    if (!name) {
      return NextResponse.json({ message: 'Fan nomi talab qilinadi' }, { status: 400 })
    }

    const subject = await db.subject.update({
      where: { id },
      data: { name, icon: icon || null },
    })

    return NextResponse.json(subject)
  } catch (error) {
    console.error('[admin] subject PUT error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const { id } = await params

    await db.subject.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Fan o\'chirildi' })
  } catch (error) {
    console.error('[admin] subject DELETE error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
