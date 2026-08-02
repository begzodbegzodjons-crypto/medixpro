import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth-server'

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

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (existing) {
      return NextResponse.json(
        { message: 'Bu email allaqachon ro\'yxatdan o\'tgan' },
        { status: 409 }
      )
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name?.trim() || null,
      },
    })

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: 'Hisob muvaffaqiyatli yaratildi',
    })
  } catch (error: any) {
    console.error('[signup] error:', error)
    return NextResponse.json(
      { message: error?.message || 'Server xatosi' },
      { status: 500 }
    )
  }
}
