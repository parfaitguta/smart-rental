// backend/src/config/paypack.js
import dotenv from 'dotenv'

dotenv.config()

const PAYPACK_BASE_URL = process.env.PAYPACK_BASE_URL || 'https://payments.paypack.rw/api'
const MODE = process.env.PAYPACK_MODE || 'live'

// Create a simple HTTP client for Paypack
const paypackClient = {
  // Authentication
  auth: async () => {
    try {
      const response = await fetch(`${PAYPACK_BASE_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.PAYPACK_CLIENT_ID,
          client_secret: process.env.PAYPACK_CLIENT_SECRET
        })
      })
      return await response.json()
    } catch (error) {
      console.error('Auth error:', error)
      return { error: error.message }
    }
  },
  
  // Initiate cashin (payment request)
  cashin: async ({ amount, number, mode }) => {
    console.log(`💰 Paying ${amount} RWF to ${number} in ${mode || MODE} mode`)
    
    try {
      // For sandbox mode, return mock success
      if (MODE === 'sandbox' || mode === 'sandbox') {
        console.log('🔧 Sandbox mode - mock payment')
        return {
          success: true,
          data: {
            ref: `SANDBOX_${Date.now()}`,
            status: 'pending',
            amount: amount,
            message: 'Sandbox test payment - no real money deducted'
          }
        }
      }
      
      // First get auth token for live mode
      const auth = await paypackClient.auth()
      const token = auth?.data?.access_token || auth?.access_token
      
      const response = await fetch(`${PAYPACK_BASE_URL}/cashin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          amount: amount,
          number: number,
          mode: mode || MODE
        })
      })
      
      const result = await response.json()
      console.log('Cashin response:', result)
      return result
    } catch (error) {
      console.error('Cashin error:', error)
      return { error: error.message }
    }
  },
  
  // Check transaction status
  status: async ({ ref }) => {
    try {
      const auth = await paypackClient.auth()
      const token = auth?.data?.access_token || auth?.access_token
      
      const response = await fetch(`${PAYPACK_BASE_URL}/cashin/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ ref })
      })
      
      return await response.json()
    } catch (error) {
      console.error('Status error:', error)
      return { error: error.message }
    }
  },
  
  // Mock response for testing
  mock: async ({ amount, number }) => {
    console.log(`🔧 MOCK payment: ${amount} RWF to ${number}`)
    return {
      success: true,
      data: {
        ref: `MOCK_${Date.now()}`,
        status: 'successful',
        amount: amount,
        message: 'Mock payment successful'
      }
    }
  }
}

console.log('✅ PayPack client ready')
console.log('📦 Mode:', MODE)

export default paypackClient