require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const { testConnection } = require('./src/config/db')
const authRoutes    = require('./src/router/auth.routes')
const userRoutes    = require('./src/router/user.routes')
const productRoutes = require('./src/router/product.routes')

const app  = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))
app.use(express.json())

app.use('/auth',     authRoutes)
app.use('/usuarios', userRoutes)
app.use('/produtos', productRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada.' }))
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Erro interno do servidor.' })
})

// Exporta o app para os testes (supertest), sobe o servidor só se chamado diretamente
if (require.main === module) {
  async function main() {
    await testConnection()
    app.listen(PORT, () => console.log(`🚀 Servidor em http://localhost:${PORT}`))
  }
  main()
}

module.exports = app