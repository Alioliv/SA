/**
 * Testes Unitários — Front-end (Jest + React Testing Library)
 * CT-09 a CT-12
 *
 * Arquivo: Front-end/loja/tests/components.test.jsx
 * Como rodar: npx jest  (dentro de Front-end/loja)
 */

/* global jest */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { jest } from '@jest/globals'

// ── Mocks ────────────────────────────────────────────────────

const mockLogin = jest.fn() 
const mockNavigate = jest.fn()
let mockUser = null


jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, login: mockLogin, logout: jest.fn() }),
  AuthContext: { Provider: ({ children }) => children },
  AuthProvider: ({ children }) => children,
}))

jest.mock('../src/services/api', () => ({
  authService: {
    login:    jest.fn(),
    register: jest.fn(),
  },
  productService: { getAll: jest.fn().mockResolvedValue([]) },
  userService:    { getAll: jest.fn().mockResolvedValue([]) },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

const LoginForm     = require('../src/components/LoginForm/LoginForm').default
const PrivateRouter = require('../src/components/PrivateRouter/PrivateRouter').default
const ProdutoForm   = require('../src/pages/Produtos/ProdutoForm').default

// ── Helper ───────────────────────────────────────────────────
function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  )
}

// ════════════════════════════════════════════════════════════
//  CT-09 — LoginForm renderiza campos obrigatórios (RF-10)
// ════════════════════════════════════════════════════════════
describe('CT-09 — Renderização do LoginForm', () => {
  test('deve exibir campos de e-mail, senha e botão Entrar', () => {
    renderWithRouter(<LoginForm />)

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: /entrar/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toBeEnabled()
  })
})

// ════════════════════════════════════════════════════════════
//  CT-10 — LoginForm exibe erro com campos vazios (RF-12)
// ════════════════════════════════════════════════════════════
describe('CT-10 — Mensagem de erro ao submeter login com campos vazios', () => {
  test('deve exibir "Preencha e-mail e senha." ao clicar em Entrar sem preencher', async () => {
    renderWithRouter(<LoginForm />)

    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText(/preencha e-mail e senha/i)).toBeInTheDocument()
  })
})

// ════════════════════════════════════════════════════════════
//  CT-11 — PrivateRouter redireciona sem autenticação (RF-16)
// ════════════════════════════════════════════════════════════
describe('CT-11 — PrivateRouter redireciona para /login sem autenticação', () => {
  test('deve redirecionar para /login quando user é null', () => {
    mockUser = null

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

    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
    expect(screen.getByText('Página de Login')).toBeInTheDocument()
  })
})

// ════════════════════════════════════════════════════════════
//  CT-12 — ProdutoForm preenche campos com produto (RF-20)
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
    expect(
      screen.getByRole('button', { name: /salvar alterações/i })
    ).toBeInTheDocument()
  })
})