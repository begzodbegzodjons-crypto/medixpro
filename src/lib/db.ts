import { connect, type Connection } from '@tidbcloud/serverless'

const FALLBACK_URL = 'mysql://2PS5aujUXSKBu38.root:j42agDdHIrQLJhwo@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/ustozpro'

function getDatabaseUrl(): string {
  const envUrl = process.env.USTOZPRO_DATABASE_URL || process.env.DATABASE_URL
  // Only use env URL if it's a valid mysql:// URL (not file:// SQLite)
  if (envUrl && envUrl.startsWith('mysql://')) return envUrl
  return FALLBACK_URL
}

const DATABASE_URL = getDatabaseUrl()

const globalForDb = globalThis as unknown as { tidbConn: Connection | undefined }

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

export async function transaction<T>(fn: (tx: { execute: (sql: string, params?: any[]) => Promise<any> }) => Promise<T>): Promise<T> {
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
