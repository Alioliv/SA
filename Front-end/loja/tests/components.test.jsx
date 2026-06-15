/**
 * Testes Unitários — Front-end (Jest + React Testing Library)
 * CT-09 a CT-12
 *
 * Como rodar: npm test  (dentro de Front-end/loja)
 *
 * Estes testes ficam em: Front-end/loja/src/tests/components.test.jsx
 * Copie este arquivo para essa pasta.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// ── Mocks ────────────────────────────────────────────────────

// Mock do AuthContext
const mockLogin = jest.fn()
let mockUser = null  // null = não autenticado

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, login: mockLogin, logout: jest.fn() }),
  AuthContext: { Provider: ({ children }) => children },
  AuthProvider: ({ children }) => children,
}))

// Mock do authService (api.js) — evita chamadas HTTP reais
jest.mock('../../services/api', () => ({
  authService: {
    login:    jest.fn(),
    register: jest.fn(),
  },
  productService: { getAll: jest.fn().mockResolvedValue([]) },
  userService:    { getAll: jest.fn().mockResolvedValue([]) },
}))

// Mock do react-router-dom (navigate)
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

// Importa os componentes DEPOIS dos mocks
const LoginForm    = require('../../components/LoginForm/LoginForm').default
const PrivateRouter = require('../../components/PrivateRouter/PrivateRouter').default
const ProdutoForm  = require('../../pages/Produtos/ProdutoForm').default

// ─────────────────────────────────────────────────────────────
//  Helper: renderiza componente dentro de MemoryRouter
// ─────────────────────────────────────────────────────────────
function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  )
}

// ════════════════════════════════════════════════════════════
//  CT-09 — LoginForm renderiza campos obrigatórios
// ════════════════════════════════════════════════════════════
describe('CT-09 — Renderização do LoginForm', () => {
  test('deve exibir campos de e-mail, senha e botão Entrar', () => {
    renderWithRouter(<LoginForm />)

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled()
  })
})

// ════════════════════════════════════════════════════════════
//  CT-10 — LoginForm exibe erro com campos vazios
// ════════════════════════════════════════════════════════════
describe('CT-10 — Mensagem de erro ao submeter login com campos vazios', () => {
  test('deve exibir "Preencha e-mail e senha." ao clicar em Entrar sem preencher', async () => {
    renderWithRouter(<LoginForm />)

    const btnEntrar = screen.getByRole('button', { name: /entrar/i })
    await userEvent.click(btnEntrar)

    expect(await screen.findByText(/preencha e-mail e senha/i)).toBeInTheDocument()
  })
})

// ════════════════════════════════════════════════════════════
//  CT-11 — PrivateRouter redireciona sem usuário autenticado
// ════════════════════════════════════════════════════════════
describe('CT-11 — PrivateRouter redireciona para /login sem autenticação', () => {
  test('deve redirecionar para /login quando user é null', () => {
    mockUser = null  // sem usuário

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <PrivateRouter>
                <div>Conteúdo protegido</div>
              </PrivateRouter>
            }
          />
          <Route path="/login" element={<div>Página de Login</div>} />
        </Routes>
      </MemoryRouter>
    )

    // O conteúdo protegido não deve aparecer
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
    // A página de login deve ser renderizada
    expect(screen.getByText('Página de Login')).toBeInTheDocument()
  })
})

// ════════════════════════════════════════════════════════════
//  CT-12 — ProdutoForm preenche campos com dados do produto
// ════════════════════════════════════════════════════════════
describe('CT-12 — ProdutoForm preenche campos com produto existente', () => {
  const produtoInicial = {
    nome:      'Camiseta',
    categoria: 'Camisetas',
    preco:     49.90,
    estoque:   10,
    descricao: '',
  }

  test('deve exibir campos preenchidos e botão "Salvar alterações"', () => {
    renderWithRouter(
      <ProdutoForm
        inicial={produtoInicial}
        onSalvar={jest.fn()}
        onCancelar={jest.fn()}
        salvando={false}
        erro=""
      />
    )

    expect(screen.getByDisplayValue('Camiseta')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Camisetas')).toBeInTheDocument()
    expect(screen.getByDisplayValue('49.9')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument()
  })
})
