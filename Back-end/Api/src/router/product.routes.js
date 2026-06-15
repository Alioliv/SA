const express = require('express')
const productService = require('../services/product.service')
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    res.json(await productService.getAll())
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const p = await productService.getById(Number(req.params.id))
    if (!p) return res.status(404).json({ message: 'Produto não encontrado.' })
    res.json(p)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    res.status(201).json(await productService.create(req.body))
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    res.json(await productService.update(Number(req.params.id), req.body))
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    res.json(await productService.delete(Number(req.params.id)))
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

module.exports = router