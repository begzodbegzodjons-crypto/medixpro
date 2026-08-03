// Test direct mysql2 connection to TiDB
import mysql from 'mysql2/promise'
import fs from 'fs'

async function main() {
  const ca = fs.readFileSync('/home/z/my-project/certs/tidb-ca.pem', 'utf-8')
  console.log('CA cert length:', ca.length)

  const pool = mysql.createPool({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2PS5aujUXSKBu38.root',
    password: 'Wko2XOaA6o8m1AAU',
    database: 'ustozpro',
    ssl: { ca },
    waitForConnections: true,
    connectionLimit: 3,
  })

  console.log('Pool created')

  try {
    const [rows] = await pool.query('SELECT 1 as test')
    console.log('Query result:', rows)

    const [tables] = await pool.query('SHOW TABLES')
    console.log('Tables:', tables.map((r: any) => Object.values(r)[0]))
  } catch (e: any) {
    console.error('Error:', e.message)
    console.error('Code:', e.code)
  } finally {
    await pool.end()
  }
}

main()
