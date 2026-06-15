const { pool } = require('../config/db')
const bcrypt = require('bcryptjs')

const userService = {

  async getAll() {
    const { rows } = await pool.query(
      'SELECT id, nome, email, criado_em FROM usuarios ORDER BY criado_em DESC'
    )
    return rows
  },

  async getById(id) {
    const { rows } = await pool.query(
      'SELECT id, nome, email, criado_em FROM usuarios WHERE id = $1',
      [id]
    )
    return rows[0] || null
  },

  async getByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    )
    return rows[0] || null
  },

  async create({ nome, email, senha }) {
    const existing = await userService.getByEmail(email)
    if (existing) {
      const err = new Error('E-mail já cadastrado.')
      err.status = 409
      throw err
    }

    const hash = await bcrypt.hash(senha, 10)
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, email, senha)
       VALUES ($1, $2, $3)
       RETURNING id, nome, email, criado_em`,
      [nome, email, hash]
    )
    return rows[0]
  },

  async update(id, { nome, email, senha }) {
    const usuario = await userService.getById(id)
    if (!usuario) {
      const err = new Error('Usuário não encontrado.')
      err.status = 404
      throw err
    }

    if (email && email !== usuario.email) {
      const existing = await userService.getByEmail(email)
      if (existing) {
        const err = new Error('E-mail já em uso por outro usuário.')
        err.status = 409
        throw err
      }
    }

    const novoNome  = nome  || usuario.nome
    const novoEmail = email || usuario.email

    if (senha) {
      const hash = await bcrypt.hash(senha, 10)
      await pool.query(
        'UPDATE usuarios SET nome=$1, email=$2, senha=$3 WHERE id=$4',
        [novoNome, novoEmail, hash, id]
      )
    } else {
      await pool.query(
        'UPDATE usuarios SET nome=$1, email=$2 WHERE id=$3',
        [novoNome, novoEmail, id]
      )
    }

    return userService.getById(id)
  },

  async delete(id) {
    const usuario = await userService.getById(id)
    if (!usuario) {
      const err = new Error('Usuário não encontrado.')
      err.status = 404
      throw err
    }
    await pool.query('DELETE FROM usuarios WHERE id=$1', [id])
    return { message: 'Usuário excluído com sucesso.' }
  },
}

module.exports = userService