import { connect, type Connection } from '@tidbcloud/serverless'

/**
 * TiDB Cloud Serverless driver (HTTP-based, edge-compatible).
 *
 * This driver uses HTTPS to communicate with TiDB Cloud - no raw TCP/TLS
 * sockets required. Works in Cloudflare Workers, Vercel Edge, Deno Deploy,
 * and any environment with fetch().
 *
 * Environment variables:
 *   USTOZPRO_DATABASE_URL - mysql:// URL (TiDB Cloud connection string)
 *
 * Transactions:TiDB serverless driver supports interactive transactions via
 * `conn.begin()` -> `tx.execute()` -> `tx.commit()`.
 */

// Fallback connection string (used if env var not set - for demo purposes)
// In production, set USTOZPRO_DATABASE_URL as a Secret in Cloudflare dashboard
const FALLBACK_DB_URL = 'mysql://2PS5aujUXSKBu38.root:Wko2XOaA6o8m1AAU@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/ustozpro'

const globalForDb = globalThis as unknown as {
  tidbConn: Connection | undefined
}

function getDatabaseUrl(): string {
  // Try env var first (set as Secret in Cloudflare dashboard)
  const envUrl = process.env.USTOZPRO_DATABASE_URL || process.env.DATABASE_URL
  if (envUrl) return envUrl
  // Fallback to hardcoded (demo only - replace with your Secret in production)
  return FALLBACK_DB_URL
}

function getConnection(): Connection {
  if (!globalForDb.tidbConn) {
    const url = getDatabaseUrl()
    try {
      globalForDb.tidbConn = connect({ url })
    } catch (e) {
      console.error('[db] Failed to connect:', e)
      throw e
    }
  }
  return globalForDb.tidbConn
}

/** Stateless connection (one-off queries). */
export const pool = {
  execute: async (sql: string, params: any[] = []) => {
    return getConnection().execute(sql, params)
  },
  query: async (sql: string, params: any[] = []) => {
    return getConnection().execute(sql, params)
  },
  end: async () => {
    // Stateless - nothing to close
  },
}

/**
 * Execute a SELECT query and return rows.
 * Returns array of rows directly (not wrapped in [rows, fields]).
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const result = await getConnection().execute(sql, params)
  // @tidbcloud/serverless returns { rows, ... } for SELECTs
  return (result as any).rows ?? result as T
}

/**
 * Execute an INSERT/UPDATE/DELETE.
 */
export async function execute<T = any>(sql: string, params: any[] = []): Promise<T> {
  const result = await getConnection().execute(sql, params)
  return result as T
}

/**
 * Transaction wrapper - uses TiDB serverless driver's interactive transaction.
 *
 * Usage:
 *   const result = await transaction(async (tx) => {
 *     await tx.execute('INSERT ...', [...])
 *     await tx.execute('UPDATE ...', [...])
 *     return { success: true }
 *   })
 */
export async function transaction<T>(
  fn: (tx: { execute: (sql: string, params?: any[]) => Promise<any> }) => Promise<T>
): Promise<T> {
  const conn = getConnection()
  const tx = await conn.begin()
  try {
    const result = await fn({
      execute: async (sql: string, params: any[] = []) => {
        return tx.execute(sql, params)
      },
    })
    await tx.commit()
    return result
  } catch (err) {
    await tx.rollback()
    throw err
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
