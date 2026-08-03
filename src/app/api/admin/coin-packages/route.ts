import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const packages = await db.coinPackage.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error('[admin] coin packages GET error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const { name, coins, code } = await request.json()

    if (!name || !coins || !code) {
      return NextResponse.json(
        { message: 'Barcha maydonlar talab qilinadi' },
        { status: 400 }
      )
    }

    const pkg = await db.coinPackage.create({
      data: {
        name,
        coins: Number(coins),
        code: String(code).toUpperCase(),
        isActive: true,
      },
    })

    return NextResponse.json(pkg)
  } catch (error: any) {
    console.error('[admin] coin packages POST error:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { message: 'Bu kod allaqachon mavjud' },
        { status: 400 }
      )
    }
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
