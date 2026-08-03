import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function PATCH(
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
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.position !== undefined) data.position = body.position
    if (body.link !== undefined) data.link = body.link

    const ad = await db.advertisement.update({ where: { id }, data })

    return NextResponse.json(ad)
  } catch (error) {
    console.error('[admin] ad PATCH error:', error)
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

    await db.advertisement.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Reklama o\'chirildi' })
  } catch (error) {
    console.error('[admin] ad DELETE error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
