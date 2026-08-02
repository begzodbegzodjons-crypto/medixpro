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
    const body = await request.json()

    const data: any = {}
    if (body.subjectId !== undefined) data.subjectId = body.subjectId
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.fileUrl !== undefined) data.fileUrl = body.fileUrl
    if (body.type !== undefined) data.type = body.type
    if (body.price !== undefined) data.price = Number(body.price)

    const material = await db.material.update({ where: { id }, data })

    return NextResponse.json(material)
  } catch (error) {
    console.error('[admin] material PUT error:', error)
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

    await db.material.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Material o\'chirildi' })
  } catch (error) {
    console.error('[admin] material DELETE error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
