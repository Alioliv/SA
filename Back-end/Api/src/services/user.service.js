import prisma from '../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'secret123'

export async function createUser(req, res) {
  const { name, email, password } = req.body

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Preencha todos os campos.' })

  try {
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    })
    return res.status(201).json({ id: user.id, name: user.name, email: user.email })
  } catch (err) {
    if (err.code === 'P2002')
      return res.status(409).json({ error: 'Email já cadastrado.' })
    return res.status(500).json({ error: 'Erro interno.' })
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ error: 'Preencha todos os campos.' })

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user)
      return res.status(404).json({ error: 'Usuário não encontrado.' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid)
      return res.status(401).json({ error: 'Senha incorreta.' })

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: '1d',
    })

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' })
  }
}

export async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(users)
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' })
  }
}

export async function getUserById(req, res) {
  const { id } = req.params
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true, email: true, createdAt: true },
    })
    if (!user)
      return res.status(404).json({ error: 'Usuário não encontrado.' })
    return res.json(user)
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' })
  }
}

export async function updateUser(req, res) {
  const { id } = req.params
  const { name, email } = req.body
  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email },
    })
    return res.json({ id: user.id, name: user.name, email: user.email })
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Usuário não encontrado.' })
    return res.status(500).json({ error: 'Erro.' })
  }
}

export async function deleteUser(req, res) {
  const { id } = req.params
  try {
    await prisma.user.delete({ where: { id: Number(id) } })
    return res.json({ message: 'Usuário deletado com sucesso.' })
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Usuário não encontrado.' })
    return res.status(500).json({ error: 'Erro.' })
  }
}