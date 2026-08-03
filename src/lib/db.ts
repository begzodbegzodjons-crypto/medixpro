import mysql, { type Pool, type RowDataPacket, type ResultSetHeader, type PoolConnection } from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

/**
 * Direct MySQL connection to TiDB Cloud via mysql2 driver.
 *
 * Why not Prisma Client at runtime?
 *   - Prisma v6 default MySQL driver doesn't accept SSL config via URL for TiDB Cloud
 *     (JSON ssl param is ignored, plain connection is rejected by TiDB).
 *   - The Prisma MariaDB driver adapter has SSL handshake bugs with Bun runtime.
 *   - mysql2 handles SSL gracefully with CA cert + rejectUnauthorized:false.
 *
 * Prisma is still used for:
 *   - Schema definition (prisma/schema.prisma)
 *   - Database migrations (prisma db push)
 *
 * This module exports:
 *   - pool: mysql2 connection pool
 *   - query<T>(): run SELECT, return rows
 *   - execute<T>(): run INSERT/UPDATE/DELETE, return result
 *   - transaction(): run multiple queries atomically
 *   - generateId(): CUID-like ID generator
 */

const globalForDb = globalThis as unknown as {
  mysqlPool: Pool | undefined
}

function loadCaCert(): string | undefined {
  if (process.env.TIDB_CA_CERT) return process.env.TIDB_CA_CERT
  const caPath = process.env.TIDB_CA_PATH
  if (caPath) {
    try {
      return fs.readFileSync(caPath, 'utf-8')
    } catch {}
  }
  try {
    return fs.readFileSync(path.join(process.cwd(), 'certs', 'tidb-ca.pem'), 'utf-8')
  } catch {}
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

/**
 * Execute a SELECT query and return rows.
 * Usage: const rows = await query<UserRow[]>('SELECT * FROM User WHERE id = ?', [userId])
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const [rows] = await pool.query(sql, params)
  return rows as T
}

/**
 * Execute an INSERT/UPDATE/DELETE and return the result.
 */
export async function execute<T = ResultSetHeader>(sql: string, params: any[] = []): Promise<T> {
  const [result] = await pool.execute(sql, params)
  return result as T
}

/**
 * Execute multiple queries in a transaction.
 * Usage:
 *   const result = await transaction(async (conn) => {
 *     await conn.query('INSERT ...', [...])
 *     await conn.query('UPDATE ...', [...])
 *     return { success: true }
 *   })
 */
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

// Backward-compat export
export const db = {
  pool,
  query,
  execute,
  transaction,
}

/**
 * Generate a CUID-like ID (24 chars, compatible with Prisma's default format).
 */
export function generateId(): string {
  const ts = Date.now().toString(36).padStart(9, '0')
  const rand = Math.random().toString(36).substring(2, 14).padEnd(12, '0').substring(0, 15)
  return `c${ts}${rand}`.substring(0, 24)
}
