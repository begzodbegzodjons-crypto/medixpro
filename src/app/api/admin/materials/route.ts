import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const materials = await db.material.findMany({
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(materials)
  } catch (error) {
    console.error('[admin] materials GET error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const body = await request.json()
    const { subjectId, title, description, fileUrl, type, price } = body

    if (!subjectId || !title || !fileUrl || !type) {
      return NextResponse.json(
        { message: 'Fan, sarlavha, fayl URL va tur talab qilinadi' },
        { status: 400 }
      )
    }

    if (!['pdf', 'video'].includes(type)) {
      return NextResponse.json(
        { message: 'Tur faqat "pdf" yoki "video" bo\'lishi mumkin' },
        { status: 400 }
      )
    }

    const material = await db.material.create({
      data: {
        subjectId,
        title,
        description: description || null,
        fileUrl,
        type,
        price: price ? Number(price) : 0,
      },
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error('[admin] materials POST error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
