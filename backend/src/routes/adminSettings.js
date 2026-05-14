// backend/src/routes/adminSettings.js
import express from 'express'
import pool from '../config/db.js'

const router = express.Router()

// Get payment configuration
router.get('/payment-config', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT payment_settings FROM system_settings WHERE id = 1')
    
    if (rows.length === 0) {
      return res.json({
        PAYPACK_CLIENT_ID: '',
        PAYPACK_CLIENT_SECRET: '',
        PAYPACK_BASE_URL: 'https://payments.paypack.rw/api',
        PAYPACK_ENVIRONMENT: 'production',
        PAYPACK_MODE: 'live'
      })
    }
    
    const settings = rows[0].payment_settings || {}
    
    res.json({
      PAYPACK_CLIENT_ID: settings.paypack_client_id || '',
      PAYPACK_CLIENT_SECRET: settings.paypack_client_secret ? '••••••••' : '',
      PAYPACK_BASE_URL: settings.paypack_base_url || 'https://payments.paypack.rw/api',
      PAYPACK_ENVIRONMENT: settings.paypack_environment || 'production',
      PAYPACK_MODE: settings.paypack_mode || 'live'
    })
  } catch (error) {
    console.error('Error fetching payment config:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update payment configuration
router.put('/payment-config', async (req, res) => {
  try {
    const { 
      PAYPACK_CLIENT_ID, 
      PAYPACK_CLIENT_SECRET, 
      PAYPACK_BASE_URL, 
      PAYPACK_ENVIRONMENT, 
      PAYPACK_MODE 
    } = req.body

    // First get current settings
    const [rows] = await pool.query('SELECT payment_settings FROM system_settings WHERE id = 1')
    let currentSettings = {}
    
    if (rows.length > 0 && rows[0].payment_settings) {
      currentSettings = rows[0].payment_settings
    }
    
    // Update settings
    const updatedSettings = {
      ...currentSettings,
      paypack_client_id: PAYPACK_CLIENT_ID,
      paypack_client_secret: PAYPACK_CLIENT_SECRET,
      paypack_base_url: PAYPACK_BASE_URL,
      paypack_environment: PAYPACK_ENVIRONMENT,
      paypack_mode: PAYPACK_MODE
    }
    
    // Save to database
    await pool.query(
      `INSERT INTO system_settings (id, payment_settings, updated_at) 
       VALUES (1, ?, NOW()) 
       ON DUPLICATE KEY UPDATE 
       payment_settings = VALUES(payment_settings),
       updated_at = NOW()`,
      [JSON.stringify(updatedSettings)]
    )
    
    console.log(`PayPack configuration updated to ${PAYPACK_ENVIRONMENT} mode`)
    
    res.json({ 
      success: true, 
      message: `Payment configuration updated to ${PAYPACK_ENVIRONMENT} mode`,
      config: {
        PAYPACK_ENVIRONMENT,
        PAYPACK_MODE,
        PAYPACK_BASE_URL
      }
    })
  } catch (error) {
    console.error('Error saving payment config:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get full system settings
router.get('/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM system_settings WHERE id = 1')
    res.json(rows[0] || {})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router