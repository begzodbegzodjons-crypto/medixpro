import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json({ message: 'Avtorizatsiya talab qilinadi' }, { status: 401 })
    const { id } = await params
    const rows = await query<any[]>('SELECT fileUrl, fileContent, fileName, mimeType, type FROM Material WHERE id = ?', [id])
    if (rows.length === 0) return NextResponse.json({ message: 'Material topilmadi' }, { status: 404 })
    const material = rows[0]
    if (material.fileContent) {
      const buffer = Buffer.from(material.fileContent, 'base64')
      return new NextResponse(buffer, { headers: { 'Content-Type': material.mimeType || 'application/octet-stream', 'Content-Length': buffer.length.toString(), 'Cache-Control': 'no-store', 'X-Frame-Options': 'SAMEORIGIN' } })
    }
    if (material.fileUrl) return NextResponse.redirect(material.fileUrl)
    return NextResponse.json({ message: 'Fayl topilmadi' }, { status: 404 })
  } catch (error) {
    console.error('[api/materials/[id]/preview] error:', error)
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
