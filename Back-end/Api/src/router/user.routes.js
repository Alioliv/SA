import { Router } from 'express'
import {
  createUser,
  loginUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../services/user.service.js'

const router = Router()

router.post('/users', createUser)     // Cadastrar
router.post('/login', loginUser)   // Login
router.get('/users', listUsers)   // Listar todos
router.get('/users/:id', getUserById)   // Buscar por id
router.put('/users/:id', updateUser)    // Atualizar
router.delete('/users/:id', deleteUser) // Deletar

export default router
