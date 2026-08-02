import { NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token talab qilinadi' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyAdminToken(token)

    if (!payload) {
      return NextResponse.json({ message: 'Noto\'g\'ri yoki muddati o\'tgan token' }, { status: 401 })
    }

    return NextResponse.json({ success: true, admin: true })
  } catch (error) {
    console.error('[admin] verify-token error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
