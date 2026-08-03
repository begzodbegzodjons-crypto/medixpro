import { NextResponse } from 'next/server'
import { query, execute, generateId } from '@/lib/db'
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
    const ads = await query<any[]>(
      'SELECT id, title, description, imageUrl, fileType, position, isActive, link, createdAt, updatedAt FROM Advertisement ORDER BY createdAt DESC'
    )
    return NextResponse.json(
      ads.map((a) => ({ ...a, isActive: Boolean(a.isActive) }))
    )
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
      return NextResponse.json({ message: 'Reklama sarlavhasi talab qilinadi' }, { status: 400 })
    }

    let imageUrl: string | null = null
    let fileType: string | null = null

    if (file && file.size > 0) {
      await mkdir(UPLOAD_DIR, { recursive: true })
      const ext = path.extname(file.name) || ''
      const filename = `${randomUUID()}${ext}`
      const filepath = path.join(UPLOAD_DIR, filename)
      const arrayBuffer = await file.arrayBuffer()
      await writeFile(filepath, Buffer.from(arrayBuffer))
      imageUrl = `/uploads/ads/${filename}`
      fileType = file.type
    }

    const id = generateId()
    await execute(
      `INSERT INTO Advertisement (id, title, description, imageUrl, fileType, position, isActive, link, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
      [id, title, description || null, imageUrl, fileType, position, link || null]
    )

    return NextResponse.json({ id, title, description, imageUrl, fileType, position, isActive: true, link })
  } catch (error) {
    console.error('[admin] ads POST error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
