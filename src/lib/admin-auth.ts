import crypto from 'crypto'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Balandtoglar1'
const SECRET = process.env.NEXTAUTH_SECRET || 'ustoz-pro-dev-secret-change-me-in-production-32chars'

export interface AdminTokenPayload {
  admin: boolean
  timestamp: number
}

/**
 * Verify the admin password and generate a signed token.
 */
export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

/**
 * Create an HMAC-signed admin token.
 */
export function createAdminToken(payload: AdminTokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('hex')
  return `${data}.${signature}`
}

/**
 * Verify a signed admin token. Returns the payload if valid, null otherwise.
 */
export function verifyAdminToken(token: string | undefined | null): AdminTokenPayload | null {
  if (!token) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [data, signature] = parts
  const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('hex')

  if (signature !== expectedSignature) return null

  try {
    const payload: AdminTokenPayload = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
    if (!payload.admin) return null

    // Token expires after 24 hours
    const age = Date.now() - payload.timestamp
    if (age > 24 * 60 * 60 * 1000) return null

    return payload
  } catch {
    return null
  }
}

/**
 * Verify admin token from an Authorization: Bearer <token> header.
 */
export function verifyAdminRequest(authHeader: string | null): boolean {
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.substring(7)
  return verifyAdminToken(token) !== null
}
