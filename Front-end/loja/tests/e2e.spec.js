/**
 * Testes End-to-End — Playwright
 * CT-13 a CT-20
 *
 * Arquivo: Front-end/loja/tests/e2e.spec.js
 *
 * Pré-requisitos:
 *   - Front-end rodando em http://localhost:5173
 *   - Back-end rodando em http://localhost:3000
 *   - Usuário "teste@loja.com" / "123456" cadastrado no banco
 *
 * Como rodar:
 *   npx playwright test tests/e2e.spec.js --project=chromium
 */
import { test, expect } from '@playwright/test'

const BASE          = 'http://localhost:5173'
const USUARIO_TESTE = { email: 'teste@loja.com', senha: '123456' }

async function fazerLogin(page) {
  await page.goto(`${BASE}/login`)
  await page.fill('#email', USUARIO_TESTE.email)
  await page.fill('#senha', USUARIO_TESTE.senha)
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL(`${BASE}/dashboard`)
}

// ════════════════════════════════════════════════════════════
//  CT-13 — Fluxo completo de login (RF-10, RF-14)
// ════════════════════════════════════════════════════════════
test('CT-13 — Login com credenciais válidas redireciona para Dashboard', async ({ page }) => {
  await page.goto(`${BASE}/login`)
  await page.fill('#email', USUARIO_TESTE.email)
  await page.fill('#senha', USUARIO_TESTE.senha)
  await page.getByRole('button', { name: /entrar/i }).click()

  await expect(page).toHaveURL(`${BASE}/dashboard`)
  await expect(page.locator('text=Olá')).toBeVisible()
})

// ════════════════════════════════════════════════════════════
//  CT-14 — Fluxo completo de cadastro (RF-11, RF-15)
// ════════════════════════════════════════════════════════════
test('CT-14 — Cadastro de novo usuário redireciona para /login', async ({ page }) => {
  const emailUnico = `maria_${Date.now()}@loja.com`

  await page.goto(`${BASE}/cadastro`)
  await page.fill('#nome',      'Maria Souza')
  await page.fill('#email',     emailUnico)
  await page.fill('#senha',     '123456')
  await page.fill('#confirmar', '123456')
  await page.getByRole('button', { name: /criar conta/i }).click()

  await expect(page).toHaveURL(`${BASE}/login`)
})

// ════════════════════════════════════════════════════════════
//  CT-15 — Cadastrar produto pela interface (RF-18, RF-19)
// ════════════════════════════════════════════════════════════
test('CT-15 — Cadastrar produto pela interface', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/produtos`)

  await page.getByRole('button', { name: /novo produto/i }).click()
  await expect(page.locator('h3').filter({ hasText: 'Novo Produto' })).toBeVisible()

  await page.fill('#nome',    'Calça Jeans')
  await page.locator('#categoria').selectOption('Calças')
  await page.fill('#preco',   '129.90')
  await page.fill('#estoque', '50')

  await page.getByRole('button', { name: /cadastrar produto/i }).click()

  await expect(page.locator('h3').filter({ hasText: 'Novo Produto' })).not.toBeVisible()
  await expect(page.locator('table')).toContainText('Calça Jeans')
})

// ════════════════════════════════════════════════════════════
//  CT-16 — Editar produto existente (RF-20)
// ════════════════════════════════════════════════════════════
test('CT-16 — Editar produto e verificar nome atualizado na tabela', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/produtos`)

  await page.getByRole('button', { name: /editar/i }).first().click()
  await expect(page.locator('h3').filter({ hasText: 'Editar Produto' })).toBeVisible()

  await page.locator('#nome').fill('Camiseta Editada')
  await page.getByRole('button', { name: /salvar alterações/i }).click()

  // Aguarda o modal fechar e a tabela atualizar
  await page.waitForTimeout(1000)

  await expect(page.locator('h3').filter({ hasText: 'Editar Produto' })).not.toBeVisible()
  await expect(page.locator('table')).toContainText('Camiseta Editada')
})


// ════════════════════════════════════════════════════════════
//  CT-17 — Excluir produto com modal de confirmação (RF-21)
// ════════════════════════════════════════════════════════════
test('CT-17 — Excluir produto via modal de confirmação', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/produtos`)

  await page.getByRole('button', { name: /excluir/i }).first().click()
  await expect(page.locator('h3').filter({ hasText: 'Excluir Produto' })).toBeVisible()

  await page.locator('[class*="modal"] button, [class*="Modal"] button')
    .filter({ hasText: /^excluir$/i })
    .click()

  await expect(page.locator('h3').filter({ hasText: 'Excluir Produto' })).not.toBeVisible()
  await page.waitForTimeout(500)
})

// ════════════════════════════════════════════════════════════
//  CT-18 — Campo de busca filtra produtos em tempo real (RF-22)
// ════════════════════════════════════════════════════════════
test('CT-18 — Campo de busca filtra produtos por nome', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/produtos`)

  await page.waitForSelector('table')
  await page.locator('input[placeholder*="Buscar"]').fill('Camiseta')
  await page.waitForTimeout(300)

  const linhas = page.locator('table tbody tr')
  const count  = await linhas.count()

  for (let i = 0; i < count; i++) {
    const texto = await linhas.nth(i).textContent()
    expect(texto.toLowerCase()).toContain('camiseta')
  }
})

// ════════════════════════════════════════════════════════════
//  CT-19 — Cadastrar usuário pelo CRUD de usuários (RF-23, RF-24)
// ════════════════════════════════════════════════════════════
test('CT-19 — Cadastrar novo usuário pela página /usuarios', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/usuarios`)

  await expect(page.getByRole('button', { name: /novo usuário/i })).toBeVisible()
  await page.getByRole('button', { name: /novo usuário/i }).click()

  const emailUnico = `carlos_${Date.now()}@loja.com`

  await page.fill('#nome',  'Carlos Lima')
  await page.fill('#email', emailUnico)
  await page.fill('#senha', '123456')

  await page.getByRole('button', { name: /criar/i }).last().click()

  await expect(page.locator('table')).toContainText('Carlos Lima')
})

// ════════════════════════════════════════════════════════════
//  CT-20 — Excluir usuário com modal de confirmação (RF-26)
// ════════════════════════════════════════════════════════════
test('CT-20 — Excluir usuário via modal de confirmação', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/usuarios`)

  await page.waitForSelector('table')

  await page.getByRole('button', { name: /excluir/i }).first().click()

  await expect(page.locator('h3').filter({ hasText: 'Excluir Usuário' })).toBeVisible()

  await page.locator('[class*="modal"] button, [class*="Modal"] button')
    .filter({ hasText: /^excluir$/i })
    .click()

  await page.waitForTimeout(500)
  await expect(page.locator('h3').filter({ hasText: 'Excluir Usuário' })).not.toBeVisible()
})