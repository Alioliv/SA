const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(method, endpoint, body = null) {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) config.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${endpoint}`, config)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || data.error || 'Erro na requisição')
  }

  return data
}

// ── Auth ──────────────────────────────────────────────────
// POST /auth/login    → body: { email, senha }
// POST /auth/register → body: { nome, email, senha }
export const authService = {
  login:    (body) => request('POST', '/auth/login',    body),
  register: (body) => request('POST', '/auth/register', body),
}

// ── Usuários ──────────────────────────────────────────────
export const userService = {
  getAll:   ()         => request('GET',    '/usuarios'),
  create:   (body)     => request('POST',   '/usuarios',       body),
  update:   (id, body) => request('PUT',    `/usuarios/${id}`,  body),
  delete:   (id)       => request('DELETE', `/usuarios/${id}`),
}

// ── Produtos ──────────────────────────────────────────────
export const productService = {
  getAll:   ()         => request('GET',    '/produtos'),
  create:   (body)     => request('POST',   '/produtos',       body),
  update:   (id, body) => request('PUT',    `/produtos/${id}`,  body),
  delete:   (id)       => request('DELETE', `/produtos/${id}`),
}