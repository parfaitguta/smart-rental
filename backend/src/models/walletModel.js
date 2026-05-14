// backend/src/models/walletModel.js
import pool from '../config/db.js'
import paypack from '../config/paypack.js'

// Get or create landlord wallet
export const getOrCreateWallet = async (landlordId) => {
  try {
    let [rows] = await pool.query(
      'SELECT * FROM landlord_wallet WHERE landlord_id = ?',
      [landlordId]
    )

    if (rows.length === 0) {
      await pool.query(
        'INSERT INTO landlord_wallet (landlord_id, balance, total_earned, total_withdrawn) VALUES (?, 0, 0, 0)',
        [landlordId]
      )
      ;[rows] = await pool.query(
        'SELECT * FROM landlord_wallet WHERE landlord_id = ?',
        [landlordId]
      )
    }

    return rows[0]
  } catch (error) {
    console.error('Error getting wallet:', error)
    throw error
  }
}

// Update wallet balance
export const updateWalletBalance = async (landlordId, amount, type) => {
  try {
    const wallet = await getOrCreateWallet(landlordId)
    
    let newBalance = parseFloat(wallet.balance)
    let newTotalEarned = parseFloat(wallet.total_earned)
    let newTotalWithdrawn = parseFloat(wallet.total_withdrawn)
    
    if (type === 'credit') {
      newBalance += amount
      newTotalEarned += amount
    } else if (type === 'debit') {
      newBalance -= amount
      newTotalWithdrawn += amount
    }
    
    await pool.query(
      `UPDATE landlord_wallet 
       SET balance = ?, total_earned = ?, total_withdrawn = ?, updated_at = NOW()
       WHERE landlord_id = ?`,
      [newBalance, newTotalEarned, newTotalWithdrawn, landlordId]
    )
    
    // Record transaction
    await pool.query(
      `INSERT INTO payment_transactions (landlord_id, type, amount, balance_before, balance_after, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        landlordId,
        type === 'credit' ? 'rent_payment' : 'withdrawal',
        amount,
        wallet.balance,
        newBalance,
        type === 'credit' ? 'Rent payment received' : `Withdrawal request - RWF ${amount}`
      ]
    )
    
    return { balance: newBalance, total_earned: newTotalEarned, total_withdrawn: newTotalWithdrawn }
  } catch (error) {
    console.error('Error updating wallet:', error)
    throw error
  }
}

// Create withdrawal request and deduct balance
export const createWithdrawalRequest = async (landlordId, amount, phone, method) => {
  try {
    const wallet = await getOrCreateWallet(landlordId)
    
    if (parseFloat(wallet.balance) < amount) {
      throw new Error('Insufficient balance')
    }
    
    // Start a transaction
    const connection = await pool.getConnection()
    await connection.beginTransaction()
    
    try {
      // Create withdrawal request
      const [result] = await connection.query(
        `INSERT INTO withdrawal_requests (landlord_id, amount, phone, method, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [landlordId, amount, phone, method]
      )
      
      // Deduct balance immediately
      const newBalance = parseFloat(wallet.balance) - amount
      const newTotalWithdrawn = parseFloat(wallet.total_withdrawn) + amount
      
      await connection.query(
        `UPDATE landlord_wallet 
         SET balance = ?, total_withdrawn = ?, updated_at = NOW()
         WHERE landlord_id = ?`,
        [newBalance, newTotalWithdrawn, landlordId]
      )
      
      // Record transaction
      await connection.query(
        `INSERT INTO payment_transactions (landlord_id, type, amount, balance_before, balance_after, description)
         VALUES (?, 'withdrawal', ?, ?, ?, ?)`,
        [landlordId, amount, wallet.balance, newBalance, `Withdrawal request #${result.insertId} - RWF ${amount}`]
      )
      
      await connection.commit()
      
      return { id: result.insertId, amount, status: 'pending' }
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error creating withdrawal request:', error)
    throw error
  }
}

// Get withdrawal requests for landlord
export const getWithdrawalRequests = async (landlordId) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM withdrawal_requests
       WHERE landlord_id = ?
       ORDER BY created_at DESC`,
      [landlordId]
    )
    return rows
  } catch (error) {
    console.error('Error getting withdrawal requests:', error)
    throw error
  }
}

// Get transaction history
export const getTransactionHistory = async (landlordId, limit = 50) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM payment_transactions
       WHERE landlord_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [landlordId, limit]
    )
    return rows
  } catch (error) {
    console.error('Error getting transaction history:', error)
    throw error
  }
}

// Helper to format phone for PayPack
const formatPhoneForPaypack = (raw) => {
  if (!raw || typeof raw !== 'string') return ''
  let n = raw.trim().replace(/\s+/g, '')
  if (n.includes('@')) return ''
  if (n.startsWith('07')) n = '250' + n.slice(1)
  else if (n.startsWith('+250')) n = n.slice(1)
  else if (n.startsWith('7') && !n.startsWith('250')) n = '250' + n
  return n
}

// Process withdrawal (admin only) - WITH PAYPACK CASEOUT
export const processWithdrawal = async (requestId, status, adminId) => {
  try {
    const [request] = await pool.query(
      'SELECT * FROM withdrawal_requests WHERE id = ?',
      [requestId]
    )

    if (request.length === 0) {
      throw new Error('Withdrawal request not found')
    }

    const withdrawal = request[0]

    // Start transaction
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      if (status === 'completed') {
        // Format phone number for PayPack
        const formattedPhone = formatPhoneForPaypack(withdrawal.phone)
        
        if (!formattedPhone) {
          throw new Error('Invalid phone number format')
        }

        console.log(`💰 Processing PayPack cashout: ${withdrawal.amount} RWF to ${formattedPhone}`)

        // Send money via PayPack cashout
        let cashoutResult = null
        let cashoutError = null

        try {
          // Check if paypack has cashout method
          if (typeof paypack.cashout === 'function') {
            cashoutResult = await paypack.cashout({
              amount: parseFloat(withdrawal.amount),
              number: formattedPhone,
              mode: process.env.PAYPACK_MODE === 'sandbox' ? 'sandbox' : 'live'
            })
          } 
          // If no cashout method, try using cashin with negative amount? (not recommended)
          else if (process.env.PAYPACK_MODE === 'sandbox') {
            console.log('🔧 Sandbox mode - mock cashout')
            cashoutResult = {
              success: true,
              sandbox: true,
              data: {
                ref: `SANDBOX_CASHOUT_${Date.now()}`,
                status: 'successful',
                amount: withdrawal.amount
              }
            }
          }
          else {
            throw new Error('PayPack cashout method not available')
          }

          console.log('Cashout result:', cashoutResult)

          if (cashoutResult?.success === false) {
            throw new Error(cashoutResult.error || 'Cashout failed')
          }

          const reference = cashoutResult?.data?.ref || cashoutResult?.ref || `CASHOUT_${Date.now()}`

          // Update withdrawal request with reference
          await connection.query(
            `UPDATE withdrawal_requests
             SET status = ?, processed_by = ?, processed_at = NOW(), reference = ?
             WHERE id = ?`,
            ['completed', adminId, reference, requestId]
          )

          // Record successful cashout transaction
          await connection.query(
            `INSERT INTO payment_transactions (landlord_id, type, amount, description, reference_id, status)
             VALUES (?, 'withdrawal', ?, ?, ?, 'completed')`,
            [withdrawal.landlord_id, withdrawal.amount, `Cashout sent to ${withdrawal.phone}`, reference]
          )

        } catch (paypackError) {
          console.error('❌ PayPack cashout failed:', paypackError.message)
          cashoutError = paypackError.message

          // Mark withdrawal as failed
          await connection.query(
            `UPDATE withdrawal_requests
             SET status = 'failed', processed_by = ?, processed_at = NOW(), notes = ?
             WHERE id = ?`,
            [adminId, `Cashout failed: ${paypackError.message}`, requestId]
          )

          // Return balance to landlord
          await connection.query(
            `UPDATE landlord_wallet 
             SET balance = balance + ?, total_withdrawn = total_withdrawn - ?
             WHERE landlord_id = ?`,
            [withdrawal.amount, withdrawal.amount, withdrawal.landlord_id]
          )

          await connection.query(
            `INSERT INTO payment_transactions (landlord_id, type, amount, description, status)
             VALUES (?, 'deposit', ?, 'Withdrawal failed - funds returned', 'completed')`,
            [withdrawal.landlord_id, withdrawal.amount]
          )

          await connection.commit()
          return { success: false, error: cashoutError, status: 'failed' }
        }

      } else if (status === 'cancelled') {
        // If cancelled by admin, add balance back
        await connection.query(
          `UPDATE withdrawal_requests
           SET status = ?, processed_by = ?, processed_at = NOW()
           WHERE id = ?`,
          ['cancelled', adminId, requestId]
        )
        
        await connection.query(
          `UPDATE landlord_wallet 
           SET balance = balance + ?, total_withdrawn = total_withdrawn - ?
           WHERE landlord_id = ?`,
          [withdrawal.amount, withdrawal.amount, withdrawal.landlord_id]
        )
        
        await connection.query(
          `INSERT INTO payment_transactions (landlord_id, type, amount, description, status)
           VALUES (?, 'deposit', ?, 'Withdrawal cancelled by admin - funds returned', 'completed')`,
          [withdrawal.landlord_id, withdrawal.amount]
        )
      }

      await connection.commit()
      return { success: true, status }

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error processing withdrawal:', error)
    throw error
  }
}