import { NextResponse } from 'next/server'
import { query, execute, generateId } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }
    const { type = 'admin', createdById } = await request.json()
    if (!['admin', 'teacher'].includes(type)) {
      return NextResponse.json({ message: 'Noto\'g\'ri kod turi' }, { status: 400 })
    }

    let creatorId = createdById
    if (!creatorId) {
      const admins = await query<any[]>('SELECT id FROM User WHERE isAdmin = 1 LIMIT 1')
      if (admins.length > 0) {
        creatorId = admins[0].id
      } else {
        const sysId = generateId()
        await execute(
          `INSERT INTO User (id, email, name, isAdmin, createdAt, updatedAt)
           VALUES (?, ?, 'System', 1, NOW(), NOW())`,
          [sysId, `system-${Date.now()}@ustozpro.local`]
        )
        creatorId = sysId
      }
    }

    const code = `USTOZ-${randomUUID().substring(0, 8).toUpperCase()}`
    const id = generateId()
    await execute(
      `INSERT INTO AdminCode (id, code, type, isUsed, createdAt, createdById)
       VALUES (?, ?, ?, 0, NOW(), ?)`,
      [id, code, type, creatorId]
    )

    return NextResponse.json({ id, code, type })
  } catch (error) {
    console.error('[admin] generate-admin-code error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
