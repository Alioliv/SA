import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/api'
import styles from './RegisterUser.module.css'

export default function RegisterUser() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmar: '',
  })
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErro('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.nome || !form.email || !form.senha || !form.confirmar) {
      setErro('Preencha todos os campos.')
      return
    }
    if (form.senha !== form.confirmar) {
      setErro('As senhas não coincidem.')
      return
    }
    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      // POST /auth/register → { nome, email, senha }
      await authService.register({
        nome:  form.nome,
        email: form.email,
        senha: form.senha,
      })

      // redireciona para login após cadastro
      navigate('/login')
    } catch (err) {
      setErro(err.message || 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  const campos = [
    { name: 'nome',      label: 'Nome completo',   type: 'text',     placeholder: 'Seu nome completo' },
    { name: 'email',     label: 'E-mail',           type: 'email',    placeholder: 'seu@email.com'     },
    { name: 'senha',     label: 'Senha',            type: 'password', placeholder: '••••••••'          },
    { name: 'confirmar', label: 'Confirmar senha',  type: 'password', placeholder: '••••••••'          },
  ]

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>

      {campos.map(({ name, label, type, placeholder }) => (
        <div key={name} className={styles.field}>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={form[name]}
            onChange={handleChange}
            autoFocus={name === 'nome'}
          />
        </div>
      ))}

      {erro && <p className={styles.erro}>{erro}</p>}

      <button
        type="submit"
        className={styles.btnSubmit}
        disabled={loading}
      >
        {loading ? 'Criando conta…' : 'Criar conta'}
      </button>

      <p className={styles.linkLogin}>
        Já tem conta?{' '}
        <Link to="/login">Entrar</Link>
      </p>

    </form>
  )
}