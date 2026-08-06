import { connect, type Connection } from '@tidbcloud/serverless'

/**
 * TiDB Cloud Serverless driver (HTTP-based, edge-compatible).
 *
 * IMPORTANT: Connection URL is set DIRECTLY here (not via env var) because
 * Cloudflare Workers may not propagate process.env correctly in all cases.
 * This guarantees the app always connects to the database.
 *
 * For production with different credentials, edit this file or set
 * USTOZPRO_DATABASE_URL as a Secret in Cloudflare dashboard.
 */

// Direct connection - always works, no env var dependency
const DATABASE_URL = process.env.USTOZPRO_DATABASE_URL || process.env.DATABASE_URL || 'mysql://2PS5aujUXSKBu38.root:Wko2XOaA6o8m1AAU@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/ustozpro'

const globalForDb = globalThis as unknown as {
  tidbConn: Connection | undefined
}

function getConnection(): Connection {
  if (!globalForDb.tidbConn) {
    globalForDb.tidbConn = connect({ url: DATABASE_URL })
  }
  return globalForDb.tidbConn
}

export const pool = {
  execute: async (sql: string, params: any[] = []) => getConnection().execute(sql, params),
  query: async (sql: string, params: any[] = []) => getConnection().execute(sql, params),
  end: async () => {},
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const result = await getConnection().execute(sql, params)
  return (result as any).rows ?? result as T
}

export async function execute<T = any>(sql: string, params: any[] = []): Promise<T> {
  const result = await getConnection().execute(sql, params)
  return result as T
}

export async function transaction<T>(
  fn: (tx: { execute: (sql: string, params?: any[]) => Promise<any> }) => Promise<T>
): Promise<T> {
  const conn = getConnection()
  const tx = await conn.begin()
  try {
    const result = await fn({ execute: async (sql: string, params: any[] = []) => tx.execute(sql, params) })
    await tx.commit()
    return result
  } catch (err) {
    await tx.rollback()
    throw err
  }
}

export const db = { pool, query, execute, transaction }

export function generateId(): string {
  const ts = Date.now().toString(36).padStart(9, '0')
  const rand = Math.random().toString(36).substring(2, 14).padEnd(12, '0').substring(0, 15)
  return `c${ts}${rand}`.substring(0, 24)
}
