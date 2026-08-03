import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'ads')

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const ads = await db.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(ads)
  } catch (error) {
    console.error('[admin] ads GET error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request.headers.get('Authorization'))) {
      return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || ''
    const position = (formData.get('position') as string) || 'sidebar'
    const link = (formData.get('link') as string) || ''
    const file = formData.get('file') as File | null

    if (!title) {
      return NextResponse.json(
        { message: 'Reklama sarlavhasi talab qilinadi' },
        { status: 400 }
      )
    }

    let imageUrl: string | null = null
    let fileType: string | null = null

    if (file && file.size > 0) {
      // Ensure upload dir exists
      await mkdir(UPLOAD_DIR, { recursive: true })

      const ext = path.extname(file.name) || ''
      const filename = `${randomUUID()}${ext}`
      const filepath = path.join(UPLOAD_DIR, filename)

      const arrayBuffer = await file.arrayBuffer()
      await writeFile(filepath, Buffer.from(arrayBuffer))

      imageUrl = `/uploads/ads/${filename}`
      fileType = file.type
    }

    const ad = await db.advertisement.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        fileType,
        position,
        link: link || null,
        isActive: true,
      },
    })

    return NextResponse.json(ad)
  } catch (error) {
    console.error('[admin] ads POST error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
