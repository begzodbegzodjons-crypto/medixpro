import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.trim() || ''
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 20)

    if (q.length < 2) {
      return NextResponse.json({
        materials: [],
        lessonPlans: [],
        lessonMaterials: [],
        tests: [],
      })
    }

    // Run all searches in parallel for speed
    const [materials, lessonPlans, lessonMaterials, tests] = await Promise.all([
      db.material.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          price: true,
          isFree: true,
          subject: { select: { id: true, name: true, icon: true } },
        },
      }),
      db.lessonPlan.findMany({
        where: {
          isPublic: true,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          classLevel: true,
          subject: { select: { id: true, name: true, icon: true } },
        },
      }),
      db.lessonMaterial.findMany({
        where: {
          isPublic: true,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          classLevel: true,
          subject: { select: { id: true, name: true, icon: true } },
        },
      }),
      db.test.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          passingScore: true,
          subject: { select: { id: true, name: true, icon: true } },
        },
      }),
    ])

    return NextResponse.json({
      materials,
      lessonPlans,
      lessonMaterials,
      tests,
      total: materials.length + lessonPlans.length + lessonMaterials.length + tests.length,
    })
  } catch (error) {
    console.error('[api/search] error:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
