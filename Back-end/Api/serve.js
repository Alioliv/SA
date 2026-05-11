import express from 'express'
import cors from 'cors'
import userRoutes from './src/router/user.routes.js'
import { PORT } from './env.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

app.use('/api', userRoutes)

// Rota de verificação
app.get('/', (req, res) => res.json({ status: 'API rodando!' }))

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})