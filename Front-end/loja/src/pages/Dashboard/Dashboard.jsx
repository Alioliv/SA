import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { productService, userService } from '../../services/api'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [produtos, setProdutos]   = useState([])
  const [usuarios, setUsuarios]   = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      try {
        const [p, u] = await Promise.all([
          productService.getAll().catch(() => []),
          userService.getAll().catch(() => []),
        ])
        setProdutos(Array.isArray(p) ? p : p.data ?? [])
        setUsuarios(Array.isArray(u) ? u : u.data ?? [])
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Cálculos para os cards
  const totalEstoque = produtos.reduce((acc, p) => acc + (Number(p.estoque) || 0), 0)
  const valorEstoque = produtos.reduce((acc, p) => acc + (Number(p.preco) || 0) * (Number(p.estoque) || 0), 0)

  return (
    <div className={styles.page}>

      {/* ── Cabeçalho ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>L</div>
          <div>
            <h1 className={styles.titulo}>Dashboard</h1>
            <p className={styles.saudacao}>
              Olá, <strong>{user?.nome || user?.email || 'Usuário'}</strong>
            </p>
          </div>
        </div>
        <button className={styles.btnLogout} onClick={handleLogout}>
          Sair
        </button>
      </header>

      <main className={styles.main}>

        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <span>Carregando dados…</span>
          </div>
        ) : (
          <>
            {/* ── Cards ── */}
            <section className={styles.cards}>
              <div className={styles.card}>
                <span className={styles.cardLabel}>Total de Produtos</span>
                <span className={styles.cardValor}>{produtos.length}</span>
              </div>
              <div className={styles.card}>
                <span className={styles.cardLabel}>Total de Usuários</span>
                <span className={styles.cardValor}>{usuarios.length}</span>
              </div>
              <div className={styles.card}>
                <span className={styles.cardLabel}>Itens em Estoque</span>
                <span className={styles.cardValor}>{totalEstoque}</span>
              </div>
              <div className={styles.card}>
                <span className={styles.cardLabel}>Valor em Estoque</span>
                <span className={styles.cardValor}>
                  R$ {valorEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </section>

            {/* ── Tabelas ── */}
            <section className={styles.tabelas}>

              {/* Tabela Produtos */}
              <div className={styles.tabelaBox}>
                <div className={styles.tabelaHeader}>
                  <h2>Produtos recentes</h2>
                  <button
                    className={styles.btnVer}
                    onClick={() => navigate('/produtos')}
                  >
                    Ver todos
                  </button>
                </div>

                {produtos.length === 0 ? (
                  <p className={styles.vazio}>Nenhum produto cadastrado.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtos.slice(0, 5).map((p, i) => (
                        <tr key={p.id ?? i}>
                          <td>{p.nome}</td>
                          <td>
                            R$ {Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <span className={`${styles.badge} ${
                              Number(p.estoque) <= 0  ? styles.badgeVermelho :
                              Number(p.estoque) <= 10 ? styles.badgeAmarelo :
                              styles.badgeVerde
                            }`}>
                              {p.estoque}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Tabela Usuários */}
              <div className={styles.tabelaBox}>
                <div className={styles.tabelaHeader}>
                  <h2>Usuários recentes</h2>
                  <button
                    className={styles.btnVer}
                    onClick={() => navigate('/usuarios')}
                  >
                    Ver todos
                  </button>
                </div>

                {usuarios.length === 0 ? (
                  <p className={styles.vazio}>Nenhum usuário cadastrado.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.slice(0, 5).map((u, i) => (
                        <tr key={u.id ?? i}>
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.avatar}>
                                {(u.nome || 'U')[0].toUpperCase()}
                              </div>
                              {u.nome}
                            </div>
                          </td>
                          <td className={styles.muted}>{u.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </section>
          </>
        )}
      </main>
    </div>
  )
}