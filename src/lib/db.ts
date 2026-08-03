import mysql, { type Pool, type RowDataPacket, type ResultSetHeader, type PoolConnection } from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

/**
 * Direct MySQL connection to TiDB Cloud via mysql2 driver.
 *
 * Environment variables:
 *   USTOZPRO_DATABASE_URL - mysql:// URL
 *   TIDB_CA_CERT          - CA cert contents as string (production/Cloudflare) - optional
 *   TIDB_CA_PATH          - path to CA cert file (dev) - optional
 *
 * On Cloudflare Pages, nodejs_compat flag enables fs and net/tls support.
 */

const globalForDb = globalThis as unknown as {
  mysqlPool: Pool | undefined
}

function loadCaCert(): string | undefined {
  // 1. Direct cert contents (production/Cloudflare)
  if (process.env.TIDB_CA_CERT) return process.env.TIDB_CA_CERT

  // 2. File path (local dev)
  const caPath = process.env.TIDB_CA_PATH
  if (caPath) {
    try {
      return fs.readFileSync(caPath, 'utf-8')
    } catch {}
  }

  // 3. Default bundled path (works in dev)
  try {
    const defaultPath = path.join(process.cwd(), 'certs', 'tidb-ca.pem')
    return fs.readFileSync(defaultPath, 'utf-8')
  } catch {
    // Workers environment - skip
  }

  return undefined
}

function parseConnectionString(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace('/', ''),
  }
}

function createPool(): Pool {
  const url = process.env.USTOZPRO_DATABASE_URL || process.env.DATABASE_URL
  if (!url) {
    throw new Error('Database URL not configured. Set USTOZPRO_DATABASE_URL.')
  }
  const config = parseConnectionString(url)
  const ca = loadCaCert()

  return mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: ca ? { ca, rejectUnauthorized: false } : { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 50,
    connectTimeout: 30000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  })
}

export const pool: Pool = globalForDb.mysqlPool ?? createPool()

if (process.env.NODE_ENV !== 'production') globalForDb.mysqlPool = pool

export type QueryResult = RowDataPacket[] | RowDataPacket[][] | ResultSetHeader

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const [rows] = await pool.query(sql, params)
  return rows as T
}

export async function execute<T = ResultSetHeader>(sql: string, params: any[] = []): Promise<T> {
  const [result] = await pool.execute(sql, params)
  return result as T
}

export async function transaction<T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const result = await fn(conn)
    await conn.commit()
    return result
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export const db = {
  pool,
  query,
  execute,
  transaction,
}

export function generateId(): string {
  const ts = Date.now().toString(36).padStart(9, '0')
  const rand = Math.random().toString(36).substring(2, 14).padEnd(12, '0').substring(0, 15)
  return `c${ts}${rand}`.substring(0, 24)
}
