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

    const pkg = await db.coinPackage.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(pkg)
  } catch (error) {
    console.error('[admin] coin package PATCH error:', error)
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

    await db.coinPackage.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Paket o\'chirildi' })
  } catch (error) {
    console.error('[admin] coin package DELETE error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
