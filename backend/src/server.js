import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'
import rentalRequestRoutes from './routes/rentalRequestRoutes.js'
import rentalRoutes from './routes/rentalRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import imageRoutes from './routes/imageRoutes.js'
import { setupSwagger } from './config/swagger.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

setupSwagger(app)

app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/requests', rentalRequestRoutes)
app.use('/api/rentals', rentalRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/images', imageRoutes)

app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ message: '✅ Smart Rental API is running', db: 'connected' })
  } catch (error) {
    res.status(500).json({ message: '❌ Database connection failed', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})