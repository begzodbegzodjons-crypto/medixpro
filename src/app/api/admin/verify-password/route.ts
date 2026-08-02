import { NextResponse } from 'next/server'
import { verifyAdminPassword, createAdminToken } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { message: 'Parol talab qilinadi' },
        { status: 400 }
      )
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { message: "Parol noto'g'ri" },
        { status: 401 }
      )
    }

    const token = createAdminToken({
      admin: true,
      timestamp: Date.now(),
    })

    return NextResponse.json({
      success: true,
      token,
      message: 'Admin panelga xush kelibsiz',
    })
  } catch (error) {
    console.error('[admin] verify-password error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
