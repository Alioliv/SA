const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'loja_roupas',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

async function testConnection() {
  try {
    const client = await pool.connect()
    console.log('✅ PostgreSQL conectado com sucesso')
    client.release()
  } catch (err) {
    console.error('❌ Erro ao conectar no PostgreSQL:', err.message)
    process.exit(1)
  }
}

module.exports = { pool, testConnection }