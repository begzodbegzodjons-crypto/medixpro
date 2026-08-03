import { NextResponse } from 'next/server'
import { query, execute, generateId } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { invalidatePattern } from '@/lib/cache'

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }
    const subjects = await query<any[]>(
      'SELECT id, name, icon, `order`, createdAt, updatedAt FROM Subject ORDER BY `order` ASC'
    )
    return NextResponse.json(subjects)
  } catch (error) {
    console.error('[admin] subjects GET error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }
    const { name, icon } = await request.json()
    if (!name) {
      return NextResponse.json({ message: 'Fan nomi talab qilinadi' }, { status: 400 })
    }

    const countRows = await query<any[]>('SELECT COUNT(*) as cnt FROM Subject')
    const count = Number(countRows[0]?.cnt || 0)
    const id = generateId()
    await execute(
      'INSERT INTO Subject (id, name, icon, `order`, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [id, name, icon || null, count]
    )

    invalidatePattern('subjects')
    return NextResponse.json({ id, name, icon: icon || null, order: count })
  } catch (error) {
    console.error('[admin] subjects POST error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
