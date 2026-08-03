/**
 * Connect to TiDB Cloud and create the ustozpro database.
 * Run with: bun run scripts/create-tidb-db.ts
 */
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

const TIDB_CONFIG = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '2PS5aujUXSKBu38.root',
  password: 'Wko2XOaA6o8m1AAU',
  database: 'sys', // connect to sys first to create new DB
  ssl: {
    ca: fs.readFileSync(path.join(process.cwd(), 'certs/tidb-ca.pem')),
    minVersion: 'TLSv1.2',
  },
}

async function main() {
  console.log('🔌 Connecting to TiDB Cloud...')

  const conn = await mysql.createConnection(TIDB_CONFIG)
  console.log('✅ Connected to TiDB Cloud')

  // Create database if not exists
  console.log('📦 Creating database `ustozpro`...')
  await conn.query('CREATE DATABASE IF NOT EXISTS ustozpro DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
  console.log('✅ Database `ustozpro` created')

  // Switch to it and verify
  await conn.changeUser({ database: 'ustozpro' })
  const [rows] = await conn.query('SELECT DATABASE() as db')
  console.log('✅ Active database:', (rows as any)[0].db)

  await conn.end()
  console.log('\n🎉 Database ready!')
}

main().catch((e) => {
  console.error('❌ Error:', e.message)
  process.exit(1)
})
