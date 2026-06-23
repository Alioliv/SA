import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRouter from './components/PrivateRouter/PrivateRouter'

import Login     from './pages/Login/Login'
import Register  from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import Produtos  from './pages/Produtos/Produtos'
import Usuarios  from './pages/Usuarios/Usuarios' 

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Públicas ── */}
          <Route path="/login"    element={<Login />}    />
          <Route path="/cadastro" element={<Register />} />

          {/* ── Privadas ── */}
          <Route
            path="/dashboard"
            element={
              <PrivateRouter>
                <Dashboard />
              </PrivateRouter>
            }
          />
          <Route
            path="/produtos"
            element={
              <PrivateRouter>
                <Produtos />
              </PrivateRouter>
            }
          />
          {
          <Route
            path="/usuarios"
            element={
              <PrivateRouter>
                <Usuarios />
              </PrivateRouter>
            }
          />
        }

          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/login"     replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}