/**
 * Simple in-memory cache with TTL.
 * Used to cache static/semi-static data like subjects, topics, etc.
 * For 10k+ users, this drastically reduces DB load.
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

const DEFAULT_TTL = 60 * 1000 // 1 minute

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

export function setCached<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  })
}

export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const cached = getCached<T>(key)
  if (cached !== null) {
    return cached
  }

  const data = await fetcher()
  setCached(key, data, ttl)
  return data
}

export function invalidateCache(key: string): void {
  cache.delete(key)
}

export function invalidatePattern(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

// Cache key helpers
export const cacheKeys = {
  subjects: 'subjects:all',
  subjectById: (id: string) => `subject:${id}`,
  topicsBySubject: (subjectId: string) => `topics:subject:${subjectId}`,
  testsBySubject: (subjectId: string) => `tests:subject:${subjectId}`,
  materialById: (id: string) => `material:${id}`,
  testById: (id: string) => `test:${id}`,
  activeAds: 'ads:active',
  userCoinBalance: (userId: string) => `user:coins:${userId}`,
}

// TTL presets (in milliseconds)
export const TTL = {
  SHORT: 30 * 1000, // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  HOUR: 60 * 60 * 1000, // 1 hour
}
