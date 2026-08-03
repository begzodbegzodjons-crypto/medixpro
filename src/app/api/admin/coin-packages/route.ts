import { NextResponse } from 'next/server'
import { query, execute, generateId } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }
    const packages = await query<any[]>(
      'SELECT id, name, coins, code, isActive, createdAt FROM CoinPackage ORDER BY createdAt DESC'
    )
    return NextResponse.json(
      packages.map((p) => ({ ...p, isActive: Boolean(p.isActive) }))
    )
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
      return NextResponse.json({ message: 'Barcha maydonlar talab qilinadi' }, { status: 400 })
    }

    const id = generateId()
    try {
      await execute(
        'INSERT INTO CoinPackage (id, name, coins, code, isActive, createdAt) VALUES (?, ?, ?, ?, 1, NOW())',
        [id, name, Number(coins), String(code).toUpperCase()]
      )
    } catch (e: any) {
      if (e.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ message: 'Bu kod allaqachon mavjud' }, { status: 400 })
      }
      throw e
    }

    return NextResponse.json({ id, name, coins: Number(coins), code: String(code).toUpperCase(), isActive: true })
  } catch (error) {
    console.error('[admin] coin packages POST error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
