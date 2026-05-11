import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import styles from './LoginForm.module.css'

export default function LoginForm() {
  const [form, setForm]       = useState({ email: '', senha: '' })
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErro('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.email || !form.senha) {
      setErro('Preencha e-mail e senha.')
      return
    }

    setLoading(true)
    try {
      // POST /auth/login → { email, senha }
      const data = await authService.login({
        email: form.email,
        senha: form.senha,
      })

      // salva o usuário retornado pelo back no contexto + localStorage
      login(data.usuario ?? data.user ?? data)
      navigate('/dashboard')
    } catch (err) {
      setErro(err.message || 'E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>

      <div className={styles.field}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="senha"
          type="password"
          placeholder="••••••••"
          value={form.senha}
          onChange={handleChange}
          autoComplete="current-password"
        />
      </div>

      {erro && <p className={styles.erro}>{erro}</p>}

      <button
        type="submit"
        className={styles.btnSubmit}
        disabled={loading}
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>

      <p className={styles.linkCadastro}>
        Não tem conta?{' '}
        <Link to="/cadastro">Cadastre-se</Link>
      </p>

    </form>
  )
}