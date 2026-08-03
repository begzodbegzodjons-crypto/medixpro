// Test mariadb adapter with various SSL options
import mariadb from 'mariadb'

async function test(label: string, sslConfig: any) {
  console.log(`\n=== Test: ${label} ===`)
  console.log('SSL config:', JSON.stringify(sslConfig))
  const pool = mariadb.createPool({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2PS5aujUXSKBu38.root',
    password: 'Wko2XOaA6o8m1AAU',
    database: 'ustozpro',
    ssl: sslConfig,
    connectionLimit: 1,
  })

  let conn
  try {
    conn = await pool.getConnection()
    const rows = await conn.query('SELECT 1 as test')
    console.log('✅ Success:', rows[0])
  } catch (e: any) {
    console.log('❌ Error:', e.message)
    console.log('   Code:', e.code)
  } finally {
    if (conn) await conn.end()
    await pool.end()
  }
}

async function main() {
  // Test 1: just true (no CA, no validation)
  await test('ssl: true (no validation)', true)

  // Test 2: object with rejectUnauthorized false
  await test('ssl: { rejectUnauthorized: false }', { rejectUnauthorized: false })

  // Test 3: object with checkServerIdentity
  await test('ssl: { checkServerIdentity: () => undefined }', {
    checkServerIdentity: () => undefined,
  })

  // Test 4: both
  await test('ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined }', {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined,
  })
}

main()
