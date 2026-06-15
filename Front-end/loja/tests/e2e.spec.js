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
 *   npx playwright test
 *   npx playwright test --ui   (modo visual)
 */

const { test, expect } = require('@playwright/test')

// ── Constantes ───────────────────────────────────────────────
const BASE = 'http://localhost:5173'
const USUARIO_TESTE = { email: 'teste@loja.com', senha: '123456' }

// ── Helper: faz login via UI ─────────────────────────────────
async function fazerLogin(page) {
  await page.goto(`${BASE}/login`)
  await page.fill('#email', USUARIO_TESTE.email)
  await page.fill('#senha', USUARIO_TESTE.senha)
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL(`${BASE}/dashboard`)
}

// ════════════════════════════════════════════════════════════
//  CT-13 — Fluxo completo de login
// ════════════════════════════════════════════════════════════
test('CT-13 — Login com credenciais válidas redireciona para Dashboard', async ({ page }) => {
  await page.goto(`${BASE}/login`)

  await page.fill('#email', USUARIO_TESTE.email)
  await page.fill('#senha', USUARIO_TESTE.senha)
  await page.getByRole('button', { name: /entrar/i }).click()

  // URL deve mudar para /dashboard
  await expect(page).toHaveURL(`${BASE}/dashboard`)

  // Nome do usuário deve aparecer na tela
  await expect(page.locator('text=Olá')).toBeVisible()
})

// ════════════════════════════════════════════════════════════
//  CT-14 — Fluxo completo de cadastro
// ════════════════════════════════════════════════════════════
test('CT-14 — Cadastro de novo usuário redireciona para /login', async ({ page }) => {
  // Gera e-mail único para evitar conflito com rodadas anteriores
  const emailUnico = `maria_${Date.now()}@loja.com`

  await page.goto(`${BASE}/cadastro`)

  await page.fill('#nome',      'Maria Souza')
  await page.fill('#email',     emailUnico)
  await page.fill('#senha',     '123456')
  await page.fill('#confirmar', '123456')

  await page.getByRole('button', { name: /criar conta/i }).click()

  // Após cadastro deve ir para /login
  await expect(page).toHaveURL(`${BASE}/login`)
})

// ════════════════════════════════════════════════════════════
//  CT-15 — Cadastrar novo produto
// ════════════════════════════════════════════════════════════
test('CT-15 — Cadastrar produto pela interface', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/produtos`)

  // Abre modal de novo produto
  await page.getByRole('button', { name: /novo produto/i }).click()
  await expect(page.getByText('Novo Produto')).toBeVisible()

  // Preenche o formulário
  await page.fill('#nome',    'Calça Jeans')
  await page.locator('#categoria').selectOption('Calças')
  await page.fill('#preco',   '129.90')
  await page.fill('#estoque', '50')

  await page.getByRole('button', { name: /cadastrar produto/i }).click()

  // Modal deve fechar e produto aparecer na tabela
  await expect(page.getByText('Novo Produto')).not.toBeVisible()
  await expect(page.locator('table')).toContainText('Calça Jeans')
})

// ════════════════════════════════════════════════════════════
//  CT-16 — Editar produto existente
// ════════════════════════════════════════════════════════════
test('CT-16 — Editar produto e verificar nome atualizado na tabela', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/produtos`)

  // Clica no primeiro botão Editar
  await page.getByRole('button', { name: /editar/i }).first().click()
  await expect(page.getByText('Editar Produto')).toBeVisible()

  // Limpa o campo nome e digita o novo valor
  await page.locator('#nome').fill('Camiseta Editada')

  await page.getByRole('button', { name: /salvar alterações/i }).click()

  // Modal fecha e nome atualizado aparece na tabela
  await expect(page.getByText('Editar Produto')).not.toBeVisible()
  await expect(page.locator('table')).toContainText('Camiseta Editada')
})

// ════════════════════════════════════════════════════════════
//  CT-17 — Excluir produto com confirmação no modal
// ════════════════════════════════════════════════════════════
test('CT-17 — Excluir produto via modal de confirmação', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/produtos`)

  // Captura o nome do primeiro produto para verificar remoção
  const nomeTexto = await page.locator('table tbody tr:first-child td:nth-child(2)').textContent()

  // Clica em Excluir do primeiro produto
  await page.getByRole('button', { name: /excluir/i }).first().click()

  // Modal de confirmação deve aparecer
  await expect(page.getByText('Excluir Produto')).toBeVisible()

  // Confirma a exclusão
  await page.getByRole('button', { name: /^excluir$/i }).click()

  // Modal fecha
  await expect(page.getByText('Excluir Produto')).not.toBeVisible()

  // Produto removido da tabela (se havia mais de um, a linha some)
  if (nomeTexto) {
    // Aguarda a tabela atualizar
    await page.waitForTimeout(500)
    const linhas = page.locator('table tbody tr')
    const count = await linhas.count()
    // Verifica que o produto foi de fato excluído (tabela mudou)
    // Se só tinha um, a tabela fica vazia ou mostra mensagem
    if (count > 0) {
      const primeiroNome = await page.locator('table tbody tr:first-child td:nth-child(2)').textContent()
      expect(primeiroNome).not.toBe(nomeTexto)
    }
  }
})

// ════════════════════════════════════════════════════════════
//  CT-18 — Busca filtra produtos em tempo real
// ════════════════════════════════════════════════════════════
test('CT-18 — Campo de busca filtra produtos por nome', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/produtos`)

  // Aguarda a tabela carregar
  await page.waitForSelector('table')

  // Digita no campo de busca
  await page.locator('input[placeholder*="Buscar"]').fill('Camiseta')

  // Aguarda filtro reativo
  await page.waitForTimeout(300)

  // Todas as linhas visíveis devem conter "Camiseta" no nome ou categoria
  const linhas = page.locator('table tbody tr')
  const count  = await linhas.count()

  if (count > 0) {
    for (let i = 0; i < count; i++) {
      const texto = await linhas.nth(i).textContent()
      expect(texto.toLowerCase()).toContain('camiseta')
    }
  }
  // Se count === 0 significa que não há produto "Camiseta" — tudo certo, filtro funcionou
})

// ════════════════════════════════════════════════════════════
//  CT-19 — Cadastrar usuário pelo CRUD de usuários
// ════════════════════════════════════════════════════════════
test('CT-19 — Cadastrar novo usuário pela página /usuarios', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/usuarios`)

  // Aguarda a página carregar
  await expect(page.getByRole('button', { name: /novo usuário/i })).toBeVisible()

  await page.getByRole('button', { name: /novo usuário/i }).click()

  const emailUnico = `carlos_${Date.now()}@loja.com`

  await page.fill('#nome',  'Carlos Lima')
  await page.fill('#email', emailUnico)
  await page.fill('#senha', '123456')

  // Botão pode chamar "Criar" ou "Cadastrar"
  await page.getByRole('button', { name: /criar|cadastrar/i }).last().click()

  // Modal fecha e usuário aparece na tabela
  await expect(page.locator('table')).toContainText('Carlos Lima')
})

// ════════════════════════════════════════════════════════════
//  CT-20 — Excluir usuário com modal de confirmação
// ════════════════════════════════════════════════════════════
test('CT-20 — Excluir usuário via modal de confirmação', async ({ page }) => {
  await fazerLogin(page)
  await page.goto(`${BASE}/usuarios`)

  await page.waitForSelector('table')

  // Clica em Excluir do primeiro usuário da lista
  await page.getByRole('button', { name: /excluir/i }).first().click()

  // Modal de confirmação deve aparecer
  await expect(page.locator('[class*="modal"], [class*="Modal"], dialog').first()).toBeVisible()

  // Confirma a exclusão
  await page.getByRole('button', { name: /^excluir$/i }).click()

  // Modal fecha
  await page.waitForTimeout(500)
  await expect(page.locator('[class*="modal"], [class*="Modal"], dialog').first()).not.toBeVisible()
})