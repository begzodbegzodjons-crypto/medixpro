import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const subjects = await db.subject.findMany({ orderBy: { order: 'asc' } })
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

    // Determine next order
    const count = await db.subject.count()

    const subject = await db.subject.create({
      data: {
        name,
        icon: icon || null,
        order: count,
      },
    })

    return NextResponse.json(subject)
  } catch (error) {
    console.error('[admin] subjects POST error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
