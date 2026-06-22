import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/api'
import Modal from '../../components/Modal/Modal'

export default function Usuarios() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [usuarios, setUsuarios]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)   // null | 'form' | 'delete'
  const [selecionado, setSelecionado] = useState(null)
  const [salvando, setSalvando]   = useState(false)
  const [erro, setErro]           = useState('')
  const [form, setForm]           = useState({ nome: '', email: '', senha: '' })

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await userService.getAll()
      setUsuarios(Array.isArray(data) ? data : [])
    } catch {
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function abrirCadastro() {
    setForm({ nome: '', email: '', senha: '' })
    setErro('')
    setModal('form')
  }

  function abrirExclusao(u) {
    setSelecionado(u)
    setErro('')
    setModal('delete')
  }

  function fecharModal() {
    setModal(null)
    setSelecionado(null)
    setErro('')
  }

  async function handleSalvar() {
    setSalvando(true)
    setErro('')
    try {
      await userService.create(form)
      await carregar()
      fecharModal()
    } catch (err) {
      setErro(err.message || 'Erro ao salvar usuário.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir() {
    setSalvando(true)
    setErro('')
    try {
      await userService.delete(selecionado.id)
      await carregar()
      fecharModal()
    } catch (err) {
      setErro(err.message || 'Erro ao excluir usuário.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1>Usuários</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: '1rem' }}>
            ← Dashboard
          </button>
          <button onClick={() => { logout(); navigate('/login') }}>Sair</button>
        </div>
      </header>

      <button id="btn-novo-usuario" onClick={abrirCadastro} style={{ marginBottom: '1rem' }}>
        + Novo Usuário
      </button>

      {loading ? (
        <p>Carregando usuários…</p>
      ) : usuarios.length === 0 ? (
        <p>Nenhum usuário cadastrado.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => (
              <tr key={u.id ?? i}>
                <td>{i + 1}</td>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>
                  <button onClick={() => abrirExclusao(u)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Cadastro */}
      {modal === 'form' && (
        <Modal title="Novo Usuário" onClose={fecharModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label htmlFor="nome">Nome</label><br />
              <input
                id="nome"
                value={form.nome}
                onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label htmlFor="email">E-mail</label><br />
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label htmlFor="senha">Senha</label><br />
              <input
                id="senha"
                type="password"
                value={form.senha}
                onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>
            {erro && <p style={{ color: 'red' }}>{erro}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={fecharModal} disabled={salvando}>Cancelar</button>
              <button onClick={handleSalvar} disabled={salvando}>
                {salvando ? 'Criando…' : 'Criar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Confirmar Exclusão */}
      {modal === 'delete' && (
        <Modal title="Excluir Usuário" onClose={fecharModal}>
          <div>
            <p>Tem certeza que deseja excluir <strong>{selecionado?.nome}</strong>?</p>
            {erro && <p style={{ color: 'red' }}>{erro}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={fecharModal} disabled={salvando}>Cancelar</button>
              <button onClick={handleExcluir} disabled={salvando}>
                {salvando ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}