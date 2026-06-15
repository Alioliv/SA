/**
 * Testes Unitários — Back-end (Jest + Supertest)
 * CT-01 a CT-08
 *
 * Como rodar: npm test  (dentro de Back-end/Api)
 *
 * ATENÇÃO: os testes usam o banco real configurado no .env
 * Certifique-se de que o PostgreSQL está rodando e o banco existe (npm run setup-db)
 */

const request = require('supertest')
const app     = require('../serve')
const { pool } = require('../src/config/db')

// ── Limpeza antes/depois ─────────────────────────────────────
beforeAll(async () => {
  // Limpa dados de teste para garantir estado inicial limpo
  await pool.query(`DELETE FROM usuarios WHERE email IN (
    'joao@email.com', 'teste@loja.com', 'maria@loja.com'
  )`)
  await pool.query(`DELETE FROM produtos WHERE nome IN (
    'Camiseta Básica', 'Camiseta Premium', 'Calça Jeans'
  )`)
})

afterAll(async () => {
  // Limpa dados criados pelos testes e fecha o pool
  await pool.query(`DELETE FROM usuarios WHERE email IN (
    'joao@email.com', 'teste@loja.com', 'maria@loja.com'
  )`)
  await pool.query(`DELETE FROM produtos WHERE nome IN (
    'Camiseta Básica', 'Camiseta Premium', 'Calça Jeans'
  )`)
  await pool.end()
})

// ═══════════════════════════════════════════════════════════════
//  CT-01 — Cadastro com dados válidos
// ═══════════════════════════════════════════════════════════════
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
    // Senha nunca deve aparecer na resposta
    expect(res.body.user).not.toHaveProperty('senha')
  })
})

// ═══════════════════════════════════════════════════════════════
//  CT-02 — Cadastro com e-mail já existente
// ═══════════════════════════════════════════════════════════════
describe('CT-02 — Cadastro com e-mail duplicado', () => {
  test('deve rejeitar cadastro e retornar status 409', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ nome: 'Outro Nome', email: 'joao@email.com', senha: '654321' })

    expect(res.status).toBe(409)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message.toLowerCase()).toContain('e-mail')
  })
})

// ═══════════════════════════════════════════════════════════════
//  CT-03 — Login com credenciais válidas
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
//  CT-04 — Login com senha incorreta
// ═══════════════════════════════════════════════════════════════
describe('CT-04 — Login com senha incorreta', () => {
  test('deve rejeitar e retornar status 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'joao@email.com', senha: 'senhaerrada' })

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('message')
  })
})

// ═══════════════════════════════════════════════════════════════
//  CT-05 — Cadastro de produto válido
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
//  CT-06 — Listagem de produtos
// ═══════════════════════════════════════════════════════════════
describe('CT-06 — Listagem de todos os produtos', () => {
  test('deve retornar status 200 e um array com ao menos um produto', async () => {
    const res = await request(app).get('/produtos')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toHaveProperty('nome')
    expect(res.body[0]).toHaveProperty('preco')
  })
})

// ═══════════════════════════════════════════════════════════════
//  CT-07 — Atualização de produto
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
//  CT-08 — Exclusão de produto
// ═══════════════════════════════════════════════════════════════
describe('CT-08 — Exclusão de produto pelo ID', () => {
  test('deve excluir produto e retornar status 200', async () => {
    const id = global.__produtoId
    expect(id).toBeDefined()

    const res = await request(app).delete(`/produtos/${id}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message')

    // Confirma que foi removido
    const check = await request(app).get(`/produtos/${id}`)
    expect(check.status).toBe(404)
  })
})