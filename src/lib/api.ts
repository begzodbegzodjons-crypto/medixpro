/**
 * API client helper for client-side data fetching.
 * Centralizes all API calls so components are cleaner.
 */

async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || 'So\'rovda xato yuz berdi')
  }

  return data as T
}

// ============= AUTH =============

export async function redeemAdminCode(code: string) {
  return apiFetch<{ success: boolean; type: string }>('/api/admin-codes/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export async function redeemCoinPackage(code: string) {
  return apiFetch<{ success: boolean; coins: number }>('/api/coin-packages/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

// ============= SUBJECTS =============

export async function getSubjects() {
  return apiFetch<any[]>('/api/subjects')
}

export async function getTestsBySubject(subjectId: string) {
  return apiFetch<any[]>(`/api/subjects/${subjectId}/tests`)
}

export async function getTopicsBySubject(subjectId: string) {
  return apiFetch<any[]>(`/api/subjects/${subjectId}/topics`)
}

export async function getLessonPlansBySubject(
  subjectId: string,
  params?: { topicId?: string; classLevel?: string; page?: number }
) {
  const search = new URLSearchParams()
  if (params?.topicId) search.set('topicId', params.topicId)
  if (params?.classLevel) search.set('classLevel', params.classLevel)
  if (params?.page) search.set('page', String(params.page))
  const q = search.toString()
  return apiFetch<{ items: any[]; pagination: any }>(
    `/api/subjects/${subjectId}/lesson-plans${q ? `?${q}` : ''}`
  )
}

export async function getLessonMaterialsBySubject(
  subjectId: string,
  params?: { topicId?: string; classLevel?: string; page?: number }
) {
  const search = new URLSearchParams()
  if (params?.topicId) search.set('topicId', params.topicId)
  if (params?.classLevel) search.set('classLevel', params.classLevel)
  if (params?.page) search.set('page', String(params.page))
  const q = search.toString()
  return apiFetch<{ items: any[]; pagination: any }>(
    `/api/subjects/${subjectId}/lesson-materials${q ? `?${q}` : ''}`
  )
}

// ============= TESTS =============

export async function getTestById(testId: string) {
  return apiFetch<any>(`/api/tests/${testId}`)
}

export async function submitTest(
  testId: string,
  answers: string[],
  score: number,
  timeTaken: number
) {
  return apiFetch<{ passed: boolean; coinReward: number }>('/api/tests/submit', {
    method: 'POST',
    body: JSON.stringify({ testId, answers, score, timeTaken }),
  })
}

// ============= MATERIALS =============

export async function getMaterials(params?: {
  subjectId?: string
  type?: string
  isFree?: boolean
  search?: string
  page?: number
  limit?: number
}) {
  const search = new URLSearchParams()
  if (params?.subjectId) search.set('subjectId', params.subjectId)
  if (params?.type) search.set('type', params.type)
  if (params?.isFree) search.set('isFree', 'true')
  if (params?.search) search.set('search', params.search)
  if (params?.page) search.set('page', String(params.page))
  if (params?.limit) search.set('limit', String(params.limit))
  const q = search.toString()
  return apiFetch<{ items: any[]; pagination: any }>(`/api/materials${q ? `?${q}` : ''}`)
}

export async function purchaseMaterial(materialId: string) {
  return apiFetch<{ success: boolean; price?: number; title?: string }>(
    '/api/materials/purchase',
    {
      method: 'POST',
      body: JSON.stringify({ materialId }),
    }
  )
}

export async function toggleFavorite(materialId: string) {
  return apiFetch<{ success: boolean; favorited: boolean }>(
    `/api/materials/${materialId}/favorite`,
    { method: 'POST' }
  )
}

// ============= LESSON PLANS =============

export async function getLessonPlans(params?: {
  subjectId?: string
  topicId?: string
  classLevel?: string
  search?: string
  page?: number
}) {
  const search = new URLSearchParams()
  if (params?.subjectId) search.set('subjectId', params.subjectId)
  if (params?.topicId) search.set('topicId', params.topicId)
  if (params?.classLevel) search.set('classLevel', params.classLevel)
  if (params?.search) search.set('search', params.search)
  if (params?.page) search.set('page', String(params.page))
  const q = search.toString()
  return apiFetch<{ items: any[]; pagination: any }>(`/api/lesson-plans${q ? `?${q}` : ''}`)
}

export async function getLessonPlanById(id: string) {
  return apiFetch<any>(`/api/lesson-plans/${id}`)
}

// ============= LESSON MATERIALS =============

export async function getLessonMaterials(params?: {
  subjectId?: string
  topicId?: string
  classLevel?: string
  type?: string
  search?: string
  page?: number
}) {
  const search = new URLSearchParams()
  if (params?.subjectId) search.set('subjectId', params.subjectId)
  if (params?.topicId) search.set('topicId', params.topicId)
  if (params?.classLevel) search.set('classLevel', params.classLevel)
  if (params?.type) search.set('type', params.type)
  if (params?.search) search.set('search', params.search)
  if (params?.page) search.set('page', String(params.page))
  const q = search.toString()
  return apiFetch<{ items: any[]; pagination: any }>(`/api/lesson-materials${q ? `?${q}` : ''}`)
}

export async function getLessonMaterialById(id: string) {
  return apiFetch<any>(`/api/lesson-materials/${id}`)
}

// ============= LIBRARY & FAVORITES =============

export async function getLibrary() {
  return apiFetch<any[]>('/api/library')
}

export async function getFavorites() {
  return apiFetch<any[]>('/api/favorites')
}

// ============= STATS =============

export async function getStats() {
  return apiFetch<any>('/api/stats')
}

export async function getTestResults() {
  return apiFetch<any[]>('/api/test-results')
}

// ============= SEARCH =============

export async function globalSearch(q: string, limit = 10) {
  return apiFetch<{
    materials: any[]
    lessonPlans: any[]
    lessonMaterials: any[]
    tests: any[]
    total: number
  }>(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`)
}
