// backend/src/config/paypack.js
import dotenv from 'dotenv'
import paypackImport from 'paypack-js'

dotenv.config()

/** ESM interop: paypack-js exposes the class as default.default */
const Paypack = paypackImport?.default?.default ?? paypackImport?.default ?? paypackImport

const MODE = process.env.PAYPACK_MODE || 'live'

let merchantInstance = null

function getMerchant () {
  const id = process.env.PAYPACK_CLIENT_ID
  const secret = process.env.PAYPACK_CLIENT_SECRET
  if (!id || !secret) return null
  if (!merchantInstance) {
    merchantInstance = new Paypack({ client_id: id, client_secret: secret })
  }
  return merchantInstance
}

export function formatPhoneForPaypack (raw) {
  if (!raw || typeof raw !== 'string') return ''
  let n = raw.trim().replace(/\s+/g, '')
  if (n.includes('@')) return ''
  if (n.startsWith('07')) n = '250' + n.slice(1)
  else if (n.startsWith('+250')) n = n.slice(1)
  else if (n.startsWith('7') && !n.startsWith('250')) n = '250' + n
  return n
}

function normalizeProviderError (err) {
  if (!err) return 'Payment provider error'
  if (typeof err === 'string') return err
  const data = err.response?.data ?? err.data ?? err
  if (typeof data === 'string') return data
  if (data?.message && typeof data.message === 'string') return data.message
  if (data?.error && typeof data.error === 'string') return data.error
  if (err.message) return err.message
  return 'Payment provider error'
}

/**
 * Turn axios/SDK success payload into { success, data } or { success: false, error }.
 */
function normalizeCashinResponse (axiosRes) {
  const body = axiosRes?.data !== undefined ? axiosRes.data : axiosRes
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Invalid response from payment provider' }
  }
  const ref =
    body.ref ??
    body.reference ??
    body.transaction_ref ??
    body.transaction?.ref ??
    (body.data && (body.data.ref ?? body.data.reference))

  if (body.success === false && !ref) {
    return {
      success: false,
      error: body.message || body.error || 'Payment was rejected by the provider',
      details: body
    }
  }

  if (!ref) {
    return {
      success: false,
      error:
        body.message ||
        body.error ||
        'No transaction reference was returned, so nothing was sent to the phone. Check Paypack credentials and the phone number.',
      details: body
    }
  }

  const status = body.status ?? body.state ?? body.data?.status ?? 'pending'
  return {
    success: true,
    data: {
      ref: String(ref),
      status,
      amount: body.amount
    }
  }
}

/**
 * Normalize cashout response
 */
function normalizeCashoutResponse (axiosRes) {
  const body = axiosRes?.data !== undefined ? axiosRes.data : axiosRes
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Invalid response from payment provider' }
  }
  const ref =
    body.ref ??
    body.reference ??
    body.transaction_ref ??
    body.transaction?.ref ??
    (body.data && (body.data.ref ?? body.data.reference))

  if (body.success === false && !ref) {
    return {
      success: false,
      error: body.message || body.error || 'Cashout was rejected by the provider',
      details: body
    }
  }

  if (!ref) {
    return {
      success: false,
      error:
        body.message ||
        body.error ||
        'No transaction reference was returned for cashout.',
      details: body
    }
  }

  const status = body.status ?? body.state ?? body.data?.status ?? 'pending'
  return {
    success: true,
    data: {
      ref: String(ref),
      status,
      amount: body.amount
    }
  }
}

const paypackClient = {
  auth: async () => {
    const m = getMerchant()
    if (!m) {
      return { ok: false, message: 'PAYPACK_CLIENT_ID and PAYPACK_CLIENT_SECRET are required' }
    }
    try {
      const res = await m.me()
      return { ok: true, data: res?.data ?? res }
    } catch (e) {
      return { ok: false, message: normalizeProviderError(e) }
    }
  },

  cashin: async ({ amount, number, mode }) => {
    const resolvedMode = mode || MODE
    console.log(`💰 Paypack cashin ${amount} RWF → ${number} (${resolvedMode})`)

    if (MODE === 'sandbox' || resolvedMode === 'sandbox') {
      return {
        success: true,
        sandbox: true,
        data: {
          ref: `SANDBOX_${Date.now()}`,
          status: 'pending',
          amount,
          message: 'Sandbox: no real prompt is sent to the phone'
        }
      }
    }

    const merchant = getMerchant()
    if (!merchant) {
      return {
        success: false,
        error:
          'Mobile money is not configured. Set PAYPACK_CLIENT_ID and PAYPACK_CLIENT_SECRET in the environment.'
      }
    }

    const num = typeof number === 'string' ? number : String(number)
    try {
      const webhookEnv =
        resolvedMode && resolvedMode !== 'live' ? resolvedMode : process.env.PAYPACK_WEBHOOK_ENV || null

      const res = await merchant.cashin({
        amount: Number(amount),
        number: num,
        environment: webhookEnv || undefined
      })

      const normalized = normalizeCashinResponse(res)
      if (!normalized.success) {
        console.error('❌ Cashin rejected:', normalized.error)
      } else {
        console.log('✅ Cashin accepted, ref:', normalized.data.ref)
      }
      return normalized
    } catch (e) {
      const msg = normalizeProviderError(e)
      console.error('❌ Cashin error:', msg)
      return { success: false, error: msg, details: e?.response?.data }
    }
  },

  /**
   * NEW: Cashout - Send money to landlord's phone
   */
  cashout: async ({ amount, number, mode }) => {
    const resolvedMode = mode || MODE
    console.log(`💰 Paypack cashout ${amount} RWF → ${number} (${resolvedMode})`)

    // Sandbox mode - mock cashout
    if (MODE === 'sandbox' || resolvedMode === 'sandbox') {
      console.log('🔧 Sandbox mode - mock cashout')
      return {
        success: true,
        sandbox: true,
        data: {
          ref: `SANDBOX_CASHOUT_${Date.now()}`,
          status: 'successful',
          amount,
          message: 'Sandbox: test withdrawal - no real money sent'
        }
      }
    }

    const merchant = getMerchant()
    if (!merchant) {
      return {
        success: false,
        error:
          'Mobile money is not configured. Set PAYPACK_CLIENT_ID and PAYPACK_CLIENT_SECRET in the environment.'
      }
    }

    const num = typeof number === 'string' ? number : String(number)
    try {
      // Try cashout method if available
      if (typeof merchant.cashout === 'function') {
        const webhookEnv =
          resolvedMode && resolvedMode !== 'live' ? resolvedMode : process.env.PAYPACK_WEBHOOK_ENV || null

        const res = await merchant.cashout({
          amount: Number(amount),
          number: num,
          environment: webhookEnv || undefined
        })

        const normalized = normalizeCashoutResponse(res)
        if (!normalized.success) {
          console.error('❌ Cashout rejected:', normalized.error)
        } else {
          console.log('✅ Cashout accepted, ref:', normalized.data.ref)
        }
        return normalized
      } else {
        // If cashout not available in SDK, try using fetch directly
        console.log('⚠️ cashout method not in SDK, trying direct API call')
        
        // First get auth token
        const authRes = await paypackClient.auth()
        const token = authRes?.data?.access_token || authRes?.data?.token
        
        if (!token) {
          return {
            success: false,
            error: 'Could not authenticate with PayPack'
          }
        }
        
        const response = await fetch('https://payments.paypack.rw/api/cashout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: Number(amount),
            number: num,
            environment: resolvedMode !== 'live' ? resolvedMode : undefined
          })
        })
        
        const result = await response.json()
        const normalized = normalizeCashoutResponse(result)
        if (!normalized.success) {
          console.error('❌ Cashout rejected:', normalized.error)
        } else {
          console.log('✅ Cashout accepted, ref:', normalized.data.ref)
        }
        return normalized
      }
    } catch (e) {
      const msg = normalizeProviderError(e)
      console.error('❌ Cashout error:', msg)
      return { success: false, error: msg, details: e?.response?.data }
    }
  },

  status: async ({ ref }) => {
    if (!ref) return { error: 'ref is required' }
    const merchant = getMerchant()
    if (!merchant) return { error: 'Paypack not configured' }
    try {
      const res = await merchant.transaction(ref)
      return res?.data ?? res
    } catch (e) {
      return { error: normalizeProviderError(e), details: e?.response?.data }
    }
  },

  mock: async ({ amount, number }) => ({
    success: true,
    data: {
      ref: `MOCK_${Date.now()}`,
      status: 'pending',
      amount,
      message: 'Mock payment'
    }
  })
}

console.log('✅ PayPack client ready (official paypack-js)')
console.log('📦 Mode:', MODE)
console.log('📦 Cashout available:', typeof paypackClient.cashout === 'function')

export default paypackClient