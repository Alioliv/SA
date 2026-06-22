/**
 * Testes Unitários — Back-end (Jest + Supertest)
 * CT-01 a CT-08
 *
 * Arquivo: Back-end/Api/src/tests/api.test.js
 * Como rodar: npm test  (dentro de Back-end/Api)
 *
 * Pré-requisito: PostgreSQL rodando + npm run setup-db
 */

const request  = require('supertest')
const app      = require('../serve')
const { pool } = require('../src/config/db')

// ── Limpeza antes/depois ─────────────────────────────────────
beforeAll(async () => {
  await pool.query(`
    DELETE FROM usuarios
    WHERE email IN ('joao@email.com','joao2@email.com','teste@loja.com')
  `)
  await pool.query(`
    DELETE FROM produtos
    WHERE nome IN ('Camiseta Básica','Camiseta Premium','Calça Jeans')
  `)
})

afterAll(async () => {
  await pool.query(`
    DELETE FROM usuarios
    WHERE email IN ('joao@email.com','joao2@email.com','teste@loja.com')
  `)
  await pool.query(`
    DELETE FROM produtos
    WHERE nome IN ('Camiseta Básica','Camiseta Premium','Calça Jeans')
  `)
  await pool.end()
})

// ════════════════════════════════════════════════════════════
//  CT-01 — Cadastro de usuário com dados válidos (RF-01)
// ════════════════════════════════════════════════════════════
describe('CT-01 — Cadastro de usuário com dados válidos', () => {
  test('deve criar usuário e retornar status 201 com dados do usuário', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ nome: 'João Silva', email: 'joao@email.com', senha: '123456' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toMatchObject({
      nome:  'João Silva',
      email: 'joao@email.com',
    })
    expect(res.body).toHaveProperty('token')
    expect(res.body.user).not.toHaveProperty('senha')
  })
})

// ════════════════════════════════════════════════════════════
//  CT-02 — Cadastro com e-mail duplicado (RF-01)
// ════════════════════════════════════════════════════════════
describe('CT-02 — Cadastro com e-mail já existente', () => {
  test('deve rejeitar e retornar status 409 com mensagem de e-mail duplicado', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ nome: 'Outro Nome', email: 'joao@email.com', senha: '654321' })

    expect(res.status).toBe(409)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message.toLowerCase()).toContain('e-mail')
  })
})

// ════════════════════════════════════════════════════════════
//  CT-03 — Login com credenciais válidas (RF-02)
// ════════════════════════════════════════════════════════════
describe('CT-03 — Login com e-mail e senha válidos', () => {
  test('deve autenticar e retornar status 200 com token e dados do usuário', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'joao@email.com', senha: '123456' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toMatchObject({ email: 'joao@email.com' })
    expect(res.body.user).not.toHaveProperty('senha')
  })
})

// ════════════════════════════════════════════════════════════
//  CT-04 — Login com senha incorreta (RF-02)
// ════════════════════════════════════════════════════════════
describe('CT-04 — Login com senha incorreta', () => {
  test('deve rejeitar e retornar status 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'joao@email.com', senha: 'senhaerrada' })

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('message')
  })
})

// ════════════════════════════════════════════════════════════
//  CT-05 — Cadastro de produto com dados válidos (RF-06)
// ════════════════════════════════════════════════════════════
describe('CT-05 — Cadastro de produto com dados válidos', () => {
  test('deve salvar produto e retornar status 201 com dados do produto', async () => {
    const res = await request(app)
      .post('/produtos')
      .send({
        nome:      'Camiseta Básica',
        categoria: 'Camisetas',
        preco:     49.90,
        estoque:   100,
        descricao: 'Camiseta branca',
      })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      nome:      'Camiseta Básica',
      categoria: 'Camisetas',
      estoque:   100,
    })
    expect(Number(res.body.preco)).toBeCloseTo(49.90, 1)
    expect(res.body).toHaveProperty('id')

    // Guarda ID para CT-07 e CT-08
    global.__produtoId = res.body.id
  })
})

// ════════════════════════════════════════════════════════════
//  CT-06 — Listagem de todos os produtos (RF-07)
// ════════════════════════════════════════════════════════════
describe('CT-06 — Listagem de todos os produtos', () => {
  test('deve retornar status 200 e array com ao menos um produto', async () => {
    const res = await request(app).get('/produtos')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toHaveProperty('nome')
    expect(res.body[0]).toHaveProperty('preco')
  })
})

// ════════════════════════════════════════════════════════════
//  CT-07 — Atualização de produto pelo ID (RF-08)
// ════════════════════════════════════════════════════════════
describe('CT-07 — Atualização de produto pelo ID', () => {
  test('deve atualizar produto e retornar status 200 com dados atualizados', async () => {
    const id = global.__produtoId
    expect(id).toBeDefined()

    const res = await request(app)
      .put(`/produtos/${id}`)
      .send({ nome: 'Camiseta Premium', preco: 79.90 })

    expect(res.status).toBe(200)
    expect(res.body.nome).toBe('Camiseta Premium')
    expect(Number(res.body.preco)).toBeCloseTo(79.90, 1)
  })
})

// ════════════════════════════════════════════════════════════
//  CT-08 — Exclusão de produto pelo ID (RF-09)
// ════════════════════════════════════════════════════════════
describe('CT-08 — Exclusão de produto pelo ID', () => {
  test('deve excluir produto e retornar status 200 ou 204', async () => {
    const id = global.__produtoId
    expect(id).toBeDefined()

    const res = await request(app).delete(`/produtos/${id}`)
    expect([200, 204]).toContain(res.status)

    if (res.status === 200) {
      expect(res.body).toHaveProperty('message')
    }

    // Confirma remoção — deve retornar 404
    const check = await request(app).get(`/produtos/${id}`)
    expect(check.status).toBe(404)
  })
})