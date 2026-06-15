/**
 * setupDb.js — Cria o banco e as tabelas no PostgreSQL
 * Execute: npm run setup-db
 */
const { Client } = require('pg')
require('dotenv').config()

async function setup() {
  // Conecta no banco padrão "postgres" para poder criar o loja_roupas
  const client = new Client({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 5432,
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: 'postgres',
  })

  await client.connect()
  const db = process.env.DB_NAME || 'loja_roupas'

  // Cria o banco se não existir
  const { rows } = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`, [db]
  )
  if (rows.length === 0) {
    console.log(`📦 Criando banco "${db}"...`)
    await client.query(`CREATE DATABASE ${db}`)
  } else {
    console.log(`📦 Banco "${db}" já existe.`)
  }
  await client.end()

  // Agora conecta no banco correto para criar as tabelas
  const { Client: Client2 } = require('pg')
  const db2 = new Client2({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 5432,
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: db,
  })
  await db2.connect()

  console.log('📋 Criando tabelas...')

  await db2.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id        SERIAL PRIMARY KEY,
      nome      VARCHAR(100) NOT NULL,
      email     VARCHAR(150) NOT NULL UNIQUE,
      senha     VARCHAR(255) NOT NULL,
      criado_em TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `)

  await db2.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id        SERIAL PRIMARY KEY,
      nome      VARCHAR(150) NOT NULL,
      categoria VARCHAR(80),
      preco     NUMERIC(10,2) NOT NULL DEFAULT 0,
      estoque   INTEGER NOT NULL DEFAULT 0,
      descricao TEXT,
      criado_em TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `)

  console.log('✅ Banco configurado com sucesso!')
  await db2.end()
}

setup().catch(err => {
  console.error('❌ Erro no setup:', err.message)
  process.exit(1)
})