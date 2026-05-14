// backend/src/config/paypack.js
import Paypack from 'paypack-js'
import dotenv from 'dotenv'
import pool from './db.js'

dotenv.config()

let paypackInstance = null
let currentMode = null

async function getPaypackSettings() {
  try {
    const [rows] = await pool.query('SELECT payment_settings FROM system_settings WHERE id = 1')
    
    if (rows.length > 0 && rows[0].payment_settings) {
      const settings = rows[0].payment_settings
      return {
        client_id: settings.paypack_client_id || process.env.PAYPACK_CLIENT_ID,
        client_secret: settings.paypack_client_secret || process.env.PAYPACK_CLIENT_SECRET,
        mode: settings.paypack_mode || process.env.PAYPACK_MODE || 'live'
      }
    }
  } catch (error) {
    console.error('Error fetching PayPack settings from DB:', error)
  }
  
  // Fallback to environment variables
  return {
    client_id: process.env.PAYPACK_CLIENT_ID,
    client_secret: process.env.PAYPACK_CLIENT_SECRET,
    mode: process.env.PAYPACK_MODE || 'live'
  }
}

async function getPaypack() {
  const settings = await getPaypackSettings()
  
  if (!paypackInstance || currentMode !== settings.mode) {
    console.log(`Initializing PayPack with mode: ${settings.mode}`)
    paypackInstance = new Paypack.default({
      client_id: settings.client_id,
      client_secret: settings.client_secret,
      mode: settings.mode
    })
    currentMode = settings.mode
  }
  
  return paypackInstance
}

// Export a proxy that dynamically loads the paypack instance
const paypackProxy = new Proxy({}, {
  get: async (target, prop) => {
    const paypack = await getPaypack()
    if (typeof paypack[prop] === 'function') {
      return (...args) => paypack[prop](...args)
    }
    return paypack[prop]
  }
})

export default paypackProxy