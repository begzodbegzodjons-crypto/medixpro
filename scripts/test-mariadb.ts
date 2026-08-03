// Test direct MariaDB connection to TiDB
import mariadb from 'mariadb'
import fs from 'fs'

async function main() {
  const ca = fs.readFileSync('/home/z/my-project/certs/tidb-ca.pem', 'utf-8')
  console.log('CA cert length:', ca.length)

  const pool = mariadb.createPool({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2PS5aujUXSKBu38.root',
    password: 'Wko2XOaA6o8m1AAU',
    database: 'ustozpro',
    ssl: {
      rejectUnauthorized: false,
    },
    connectionLimit: 3,
  })

  console.log('Pool created')

  let conn
  try {
    conn = await pool.getConnection()
    console.log('Connected!')

    const rows = await conn.query('SELECT 1 as test')
    console.log('Query result:', rows)

    const tables = await conn.query('SHOW TABLES')
    console.log('Tables:', tables.map((r: any) => Object.values(r)[0]))
  } catch (e: any) {
    console.error('Error:', e.message)
    console.error('Code:', e.code)
  } finally {
    if (conn) await conn.end()
    await pool.end()
  }
}

main()
