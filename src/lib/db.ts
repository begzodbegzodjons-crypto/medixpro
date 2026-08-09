import mysql, { type Pool, type RowDataPacket, type ResultSetHeader, type PoolConnection } from 'mysql2/promise'

/**
 * MySQL connection to TiDB Cloud via mysql2 driver.
 * Uses nodejs_compat_v2 flag in Cloudflare Workers for TCP/TLS support.
 */

const DATABASE_URL = process.env.USTOZPRO_DATABASE_URL || process.env.DATABASE_URL || 'mysql://2PS5aujUXSKBu38.root:Wko2XOaA6o8m1AAU@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/ustozpro'

const globalForDb = globalThis as unknown as { mysqlPool: Pool | undefined }

function parseUrl(url: string) {
  const parsed = new URL(url)
  return { host: parsed.hostname, port: Number(parsed.port) || 4000, user: decodeURIComponent(parsed.username), password: decodeURIComponent(parsed.password), database: parsed.pathname.replace('/', '') }
}

function getPool(): Pool {
  if (!globalForDb.mysqlPool) {
    const c = parseUrl(DATABASE_URL)
    globalForDb.mysqlPool = mysql.createPool({
      host: c.host, port: c.port, user: c.user, password: c.password, database: c.database,
      ssl: { rejectUnauthorized: false },
      waitForConnections: true, connectionLimit: 3, queueLimit: 10,
      connectTimeout: 15000, enableKeepAlive: true, keepAliveInitialDelay: 10000,
    })
  }
  return globalForDb.mysqlPool
}

export const pool = {
  execute: async (sql: string, params: any[] = []) => { const [r] = await getPool().execute(sql, params); return r },
  query: async (sql: string, params: any[] = []) => { const [r] = await getPool().query(sql, params); return r },
  end: async () => { await getPool().end() },
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const [rows] = await getPool().execute(sql, params)
  return rows as T
}

export async function execute<T = any>(sql: string, params: any[] = []): Promise<T> {
  const [result] = await getPool().execute(sql, params)
  return result as T
}

export async function transaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await getPool().getConnection()
  try { await conn.beginTransaction(); const r = await fn(conn); await conn.commit(); return r }
  catch (err) { await conn.rollback(); throw err }
  finally { conn.release() }
}

export const db = { pool, query, execute, transaction }

export function generateId(): string {
  const ts = Date.now().toString(36).padStart(9, '0')
  const rand = Math.random().toString(36).substring(2, 14).padEnd(12, '0').substring(0, 15)
  return `c${ts}${rand}`.substring(0, 24)
}
