import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { productService } from '../../services/api'
import Modal from '../../components/Modal/Modal'
import ProdutoForm from './ProdutoForm'
import styles from './Produtos.module.css'

export default function Produtos() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const [produtos, setProdutos]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [busca, setBusca]         = useState('')
  const [modal, setModal]         = useState(null)   // null | 'form' | 'delete'
  const [selecionado, setSelecionado] = useState(null)
  const [salvando, setSalvando]   = useState(false)
  const [erro, setErro]           = useState('')

  // ── Carregar produtos ──
  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await productService.getAll()
      setProdutos(Array.isArray(data) ? data : data.data ?? [])
    } catch {
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // ── Abrir modais ──
  function abrirCadastro() {
    setSelecionado(null)
    setErro('')
    setModal('form')
  }

  function abrirEdicao(produto) {
    setSelecionado(produto)
    setErro('')
    setModal('form')
  }

  function abrirExclusao(produto) {
    setSelecionado(produto)
    setErro('')
    setModal('delete')
  }

  function fecharModal() {
    setModal(null)
    setSelecionado(null)
    setErro('')
  }

  // ── CREATE / UPDATE ──
  async function handleSalvar(formData) {
    setSalvando(true)
    setErro('')
    try {
      if (selecionado) {
        await productService.update(selecionado.id, formData)
      } else {
        await productService.create(formData)
      }
      await carregar()
      fecharModal()
    } catch (err) {
      setErro(err.message || 'Erro ao salvar produto.')
    } finally {
      setSalvando(false)
    }
  }

  // ── DELETE ──
  async function handleExcluir() {
    setSalvando(true)
    setErro('')
    try {
      await productService.delete(selecionado.id)
      await carregar()
      fecharModal()
    } catch (err) {
      setErro(err.message || 'Erro ao excluir produto.')
    } finally {
      setSalvando(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // ── Filtro de busca ──
  const produtosFiltrados = produtos.filter((p) => {
    const q = busca.toLowerCase()
    return (
      p.nome?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q)
    )
  })

  // ── Badge de estoque ──
  function badgeEstoque(qtd) {
    const n = Number(qtd)
    if (n <= 0)  return styles.badgeVermelho
    if (n <= 10) return styles.badgeAmarelo
    return styles.badgeVerde
  }

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>L</div>
          <div>
            <h1 className={styles.titulo}>Produtos</h1>
            <p className={styles.sub}>
              Olá, <strong>{user?.nome || user?.email || 'Usuário'}</strong>
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.btnDashboard} onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
          <button className={styles.btnLogout} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <main className={styles.main}>

        {/* Topo da tabela */}
        <div className={styles.topo}>
          <div className={styles.topoLeft}>
            <p className={styles.contagem}>
              {produtos.length} produto{produtos.length !== 1 ? 's' : ''} cadastrado{produtos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className={styles.topoRight}>
            {/* Busca */}
            <div className={styles.buscaWrap}>
              <span className={styles.buscaIcon}>⌕</span>
              <input
                className={styles.buscaInput}
                type="text"
                placeholder="Buscar por nome ou categoria…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              {busca && (
                <button className={styles.buscaLimpar} onClick={() => setBusca('')}>✕</button>
              )}
            </div>
            {/* Botão novo */}
            <button className={styles.btnNovo} onClick={abrirCadastro}>
              + Novo Produto
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className={styles.tableCard}>
          {loading ? (
            <div className={styles.centro}>
              <div className={styles.spinner} />
              <span>Carregando produtos…</span>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className={styles.centro}>
              <p>{busca ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}</p>
              {!busca && (
                <button className={styles.btnNovo} onClick={abrirCadastro}>
                  Cadastrar primeiro produto
                </button>
              )}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th className={styles.thAcoes}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((p, i) => (
                  <tr key={p.id ?? i}>
                    <td className={styles.tdIdx}>{i + 1}</td>
                    <td className={styles.tdNome}>{p.nome}</td>
                    <td className={styles.tdMuted}>{p.categoria || '—'}</td>
                    <td>
                      R$ {Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${badgeEstoque(p.estoque)}`}>
                        {p.estoque ?? 0}
                      </span>
                    </td>
                    <td className={styles.tdAcoes}>
                      <button
                        className={styles.btnEditar}
                        onClick={() => abrirEdicao(p)}
                      >
                        Editar
                      </button>
                      <button
                        className={styles.btnExcluir}
                        onClick={() => abrirExclusao(p)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>

      {/* ── Modal Cadastro / Edição ── */}
      {modal === 'form' && (
        <Modal
          title={selecionado ? 'Editar Produto' : 'Novo Produto'}
          onClose={fecharModal}
        >
          <ProdutoForm
            inicial={selecionado}
            onSalvar={handleSalvar}
            onCancelar={fecharModal}
            salvando={salvando}
            erro={erro}
          />
        </Modal>
      )}

      {/* ── Modal Confirmar Exclusão ── */}
      {modal === 'delete' && (
        <Modal title="Excluir Produto" onClose={fecharModal}>
          <div className={styles.deleteBox}>
            <p>
              Tem certeza que deseja excluir{' '}
              <strong>{selecionado?.nome}</strong>?
              <br />
              <span className={styles.deleteAviso}>Esta ação não pode ser desfeita.</span>
            </p>
            {erro && <p className={styles.erro}>{erro}</p>}
            <div className={styles.deleteAcoes}>
              <button
                className={styles.btnCancelar}
                onClick={fecharModal}
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                className={styles.btnDanger}
                onClick={handleExcluir}
                disabled={salvando}
              >
                {salvando ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}