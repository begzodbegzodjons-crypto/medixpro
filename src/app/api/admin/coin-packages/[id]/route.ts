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
    if (body.name !== undefined) { sets.push('name = ?'); values.push(body.name) }
    if (body.coins !== undefined) { sets.push('coins = ?'); values.push(Number(body.coins)) }
    if (body.isActive !== undefined) { sets.push('isActive = ?'); values.push(body.isActive ? 1 : 0) }
    if (sets.length === 0) return NextResponse.json({ id })
    values.push(id)
    await execute(`UPDATE CoinPackage SET ${sets.join(', ')} WHERE id = ?`, values)
    return NextResponse.json({ id })
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
    await execute('DELETE FROM CoinPackage WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Paket o\'chirildi' })
  } catch (error) {
    console.error('[admin] coin package DELETE error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
