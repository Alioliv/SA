const express = require('express')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const userService = require('../services/user.service')

const router = express.Router()

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body
    if (!nome || !email || !senha)
      return res.status(400).json({ message: 'nome, email e senha são obrigatórios.' })
    if (senha.length < 6)
      return res.status(400).json({ message: 'A senha deve ter ao menos 6 caracteres.' })

    const usuario = await userService.create({ nome, email, senha })
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    return res.status(201).json({ token, user: usuario })
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body
    if (!email || !senha)
      return res.status(400).json({ message: 'email e senha são obrigatórios.' })

    const usuario = await userService.getByEmail(email)
    if (!usuario)
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' })

    const senhaOk = await bcrypt.compare(senha, usuario.senha)
    if (!senhaOk)
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' })

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    const { senha: _, ...userSemSenha } = usuario
    return res.json({ token, user: userSemSenha })
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message })
  }
})

module.exports = router