import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
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

    const sets: string[] = []
    const values: any[] = []
    if (body.subjectId !== undefined) { sets.push('subjectId = ?'); values.push(body.subjectId) }
    if (body.title !== undefined) { sets.push('title = ?'); values.push(body.title) }
    if (body.description !== undefined) { sets.push('description = ?'); values.push(body.description) }
    if (body.fileUrl !== undefined) { sets.push('fileUrl = ?'); values.push(body.fileUrl) }
    if (body.type !== undefined) { sets.push('type = ?'); values.push(body.type) }
    if (body.price !== undefined) { sets.push('price = ?'); values.push(Number(body.price)) }
    if (body.isFree !== undefined) { sets.push('isFree = ?'); values.push(body.isFree ? 1 : 0) }
    sets.push('updatedAt = NOW()')
    values.push(id)

    await execute(`UPDATE Material SET ${sets.join(', ')} WHERE id = ?`, values)
    return NextResponse.json({ id })
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
    await execute('DELETE FROM Material WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Material o\'chirildi' })
  } catch (error) {
    console.error('[admin] material DELETE error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
