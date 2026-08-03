import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
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
    const sets: string[] = []
    const values: any[] = []
    if (body.isActive !== undefined) { sets.push('isActive = ?'); values.push(body.isActive ? 1 : 0) }
    if (body.title !== undefined) { sets.push('title = ?'); values.push(body.title) }
    if (body.description !== undefined) { sets.push('description = ?'); values.push(body.description) }
    if (body.position !== undefined) { sets.push('position = ?'); values.push(body.position) }
    if (body.link !== undefined) { sets.push('link = ?'); values.push(body.link) }
    if (sets.length === 0) return NextResponse.json({ id })
    sets.push('updatedAt = NOW()')
    values.push(id)
    await execute(`UPDATE Advertisement SET ${sets.join(', ')} WHERE id = ?`, values)
    return NextResponse.json({ id })
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
    await execute('DELETE FROM Advertisement WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Reklama o\'chirildi' })
  } catch (error) {
    console.error('[admin] ad DELETE error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
