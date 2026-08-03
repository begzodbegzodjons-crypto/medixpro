import { NextResponse } from 'next/server'
import { createUser } from '@/lib/auth-server'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email va parol talab qilinadi' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' },
        { status: 400 }
      )
    }

    try {
      const user = await createUser({ email, password, name })
      return NextResponse.json({
        success: true,
        userId: user.id,
        message: 'Hisob muvaffaqiyatli yaratildi',
      })
    } catch (e: any) {
      return NextResponse.json(
        { message: e.message || 'Xato yuz berdi' },
        { status: 409 }
      )
    }
  } catch (error: any) {
    console.error('[signup] error:', error)
    return NextResponse.json(
      { message: error?.message || 'Server xatosi' },
      { status: 500 }
    )
  }
}
