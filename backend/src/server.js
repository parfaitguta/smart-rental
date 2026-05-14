import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.options('*', cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'
import rentalRequestRoutes from './routes/rentalRequestRoutes.js'
import rentalRoutes from './routes/rentalRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import imageRoutes from './routes/imageRoutes.js'
import smsRoutes from './routes/smsRoutes.js'
import tenantRoutes from './routes/tenantRoutes.js'
import paymentRequestRoutes from './routes/paymentRequestRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import receiptRoutes from './routes/receiptRoutes.js'
import leaseRoutes from './routes/leaseRoutes.js'
import { setupSwagger } from './config/swagger.js'
import invoiceRoutes from './routes/invoiceRoutes.js'
import activityRoutes from './routes/activityRoutes.js'
import adminSettingsRoutes from './routes/adminSettings.js'  // ADD THIS
import testRoutes from './routes/testRoutes.js'
import walletRoutes from './routes/walletRoutes.js'

setupSwagger(app)

app.use('/api/invoices', invoiceRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/requests', rentalRequestRoutes)
app.use('/api/rentals', rentalRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin-settings', adminSettingsRoutes)  // ADD THIS
app.use('/api/messages', messageRoutes)
app.use('/api/images', imageRoutes)
app.use('/api/sms', smsRoutes)
app.use('/api/tenants', tenantRoutes)
app.use('/api/payment-requests', paymentRequestRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/receipts', receiptRoutes)
app.use('/api/lease', leaseRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api', testRoutes)
app.use('/api/wallet', walletRoutes)

app.get('/', (req, res) => {
  res.json({ message: '✅ Smart Rental API is running', status: 'ok' })
})

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ message: '✅ Database connected', db: 'connected' })
  } catch (error) {
    res.status(500).json({ message: '❌ Database connection failed', error: error.message })
  }
})

// CRITICAL: Bind to 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
})