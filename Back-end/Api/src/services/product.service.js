const { pool } = require('../config/db')

const productService = {

  async getAll() {
    const { rows } = await pool.query(
      'SELECT * FROM produtos ORDER BY criado_em DESC'
    )
    return rows
  },

  async getById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM produtos WHERE id=$1',
      [id]
    )
    return rows[0] || null
  },

  async create({ nome, categoria, preco, estoque, descricao }) {
    if (!nome || preco === undefined) {
      const err = new Error('Campos obrigatórios: nome e preco.')
      err.status = 400
      throw err
    }

    const { rows } = await pool.query(
      `INSERT INTO produtos (nome, categoria, preco, estoque, descricao)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, categoria || null, Number(preco), Number(estoque) || 0, descricao || null]
    )
    return rows[0]
  },

  async update(id, { nome, categoria, preco, estoque, descricao }) {
    const produto = await productService.getById(id)
    if (!produto) {
      const err = new Error('Produto não encontrado.')
      err.status = 404
      throw err
    }

    const { rows } = await pool.query(
      `UPDATE produtos
       SET nome=$1, categoria=$2, preco=$3, estoque=$4, descricao=$5
       WHERE id=$6
       RETURNING *`,
      [
        nome      !== undefined ? nome      : produto.nome,
        categoria !== undefined ? categoria : produto.categoria,
        preco     !== undefined ? Number(preco)   : produto.preco,
        estoque   !== undefined ? Number(estoque) : produto.estoque,
        descricao !== undefined ? descricao : produto.descricao,
        id,
      ]
    )
    return rows[0]
  },

  async delete(id) {
    const produto = await productService.getById(id)
    if (!produto) {
      const err = new Error('Produto não encontrado.')
      err.status = 404
      throw err
    }
    await pool.query('DELETE FROM produtos WHERE id=$1', [id])
    return { message: 'Produto excluído com sucesso.' }
  },
}

module.exports = productService