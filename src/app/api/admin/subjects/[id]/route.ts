import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { invalidatePattern } from '@/lib/cache'

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
    await execute('UPDATE Subject SET name = ?, icon = ?, updatedAt = NOW() WHERE id = ?', [name, icon || null, id])
    invalidatePattern('subjects')
    return NextResponse.json({ id, name, icon: icon || null })
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
    await execute('DELETE FROM Subject WHERE id = ?', [id])
    invalidatePattern('subjects')
    return NextResponse.json({ success: true, message: 'Fan o\'chirildi' })
  } catch (error) {
    console.error('[admin] subject DELETE error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
