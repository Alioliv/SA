import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRouter from './components/PrivateRouter/PrivateRouter'

import Login     from './pages/Login/Login'
import Register  from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'

// descomente conforme for criando:
 import Produtos  from './pages/Produtos/Produtos'
// import Usuarios  from './pages/Usuarios/Usuarios'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Públicas ── */}
          <Route path="/login"    element={<Login />}    />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} /> 



          {/* ── Privadas ── 
          <Route
            path="/dashboard"
            element={
              <PrivateRouter>
                <Dashboard />
              </PrivateRouter>
            }
          /> */}

          {/* descomente conforme for criando as páginas:
          <Route path="/produtos" element={<PrivateRouter><Produtos /></PrivateRouter>} />
          <Route path="/usuarios" element={<PrivateRouter><Usuarios /></PrivateRouter>} />
          */}
          

          {/* Raiz → redireciona */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/login"     replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}