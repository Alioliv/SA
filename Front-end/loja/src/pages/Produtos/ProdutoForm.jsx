import { useState, useEffect } from 'react'
import styles from './Produtos.module.css'

// Categorias de uma loja de roupas
const CATEGORIAS = [
  'Camisetas',
  'Calças',
  'Vestidos',
  'Shorts',
  'Blusas',
  'Casacos',
  'Calçados',
  'Acessórios',
  'Outros',
]

const vazio = {
  nome:      '',
  categoria: '',
  preco:     '',
  estoque:   '',
  descricao: '',
}

export default function ProdutoForm({ inicial, onSalvar, onCancelar, salvando, erro }) {
  const [form, setForm] = useState(vazio)

  // Preenche o form quando for edição
  useEffect(() => {
    if (inicial) {
      setForm({
        nome:      inicial.nome      || '',
        categoria: inicial.categoria || '',
        preco:     inicial.preco     || '',
        estoque:   inicial.estoque   || '',
        descricao: inicial.descricao || '',
      })
    } else {
      setForm(vazio)
    }
  }, [inicial])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSalvar({
      nome:      form.nome,
      categoria: form.categoria,
      preco:     Number(form.preco),
      estoque:   Number(form.estoque),
      descricao: form.descricao,
    })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      {/* Nome */}
      <div className={styles.field}>
        <label htmlFor="nome">Nome do produto *</label>
        <input
          id="nome"
          name="nome"
          type="text"
          placeholder="Ex: Camiseta Básica Branca"
          value={form.nome}
          onChange={handleChange}
          required
          autoFocus
        />
      </div>

      {/* Categoria */}
      <div className={styles.field}>
        <label htmlFor="categoria">Categoria</label>
        <select
          id="categoria"
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
        >
          <option value="">Selecione uma categoria</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Preço e Estoque lado a lado */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="preco">Preço (R$) *</label>
          <input
            id="preco"
            name="preco"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={form.preco}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="estoque">Estoque *</label>
          <input
            id="estoque"
            name="estoque"
            type="number"
            min="0"
            placeholder="0"
            value={form.estoque}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Descrição */}
      <div className={styles.field}>
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          name="descricao"
          placeholder="Descrição opcional do produto…"
          value={form.descricao}
          onChange={handleChange}
          rows={3}
        />
      </div>

      {/* Erro */}
      {erro && <p className={styles.erro}>{erro}</p>}

      {/* Ações */}
      <div className={styles.formAcoes}>
        <button
          type="button"
          className={styles.btnCancelar}
          onClick={onCancelar}
          disabled={salvando}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={styles.btnSalvar}
          disabled={salvando}
        >
          {salvando
            ? 'Salvando…'
            : inicial ? 'Salvar alterações' : 'Cadastrar produto'}
        </button>
      </div>

    </form>
  )
}