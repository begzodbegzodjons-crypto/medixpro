import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const { type = 'admin', createdById } = await request.json()

    if (!['admin', 'teacher'].includes(type)) {
      return NextResponse.json(
        { message: 'Noto\'g\'ri kod turi' },
        { status: 400 }
      )
    }

    // Use a system admin user as creator (or first admin)
    let creatorId = createdById
    if (!creatorId) {
      const admin = await db.user.findFirst({ where: { isAdmin: true } })
      creatorId = admin?.id
    }
    if (!creatorId) {
      // Fallback: create a placeholder system user
      const sysUser = await db.user.create({
        data: {
          email: `system-${Date.now()}@ustozpro.local`,
          name: 'System',
          isAdmin: true,
        },
      })
      creatorId = sysUser.id
    }

    const code = `USTOZ-${randomUUID().substring(0, 8).toUpperCase()}`

    const adminCode = await db.adminCode.create({
      data: {
        code,
        type,
        createdById: creatorId,
      },
    })

    return NextResponse.json(adminCode)
  } catch (error) {
    console.error('[admin] generate-admin-code error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
