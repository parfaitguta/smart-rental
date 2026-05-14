// backend/src/models/walletModel.js
import pool from '../config/db.js'

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

// Process withdrawal (admin only) - approve or reject
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
      await connection.query(
        `UPDATE withdrawal_requests
         SET status = ?, processed_by = ?, processed_at = NOW()
         WHERE id = ?`,
        [status, adminId, requestId]
      )

      // If rejected, add balance back
      if (status === 'cancelled' || status === 'failed') {
        await connection.query(
          `UPDATE landlord_wallet 
           SET balance = balance + ?, total_withdrawn = total_withdrawn - ?
           WHERE landlord_id = ?`,
          [withdrawal.amount, withdrawal.amount, withdrawal.landlord_id]
        )
        
        await connection.query(
          `INSERT INTO payment_transactions (landlord_id, type, amount, description, status)
           VALUES (?, 'deposit', ?, 'Withdrawal rejected - funds returned', 'completed')`,
          [withdrawal.landlord_id, withdrawal.amount]
        )
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

    return { success: true, status }
  } catch (error) {
    console.error('Error processing withdrawal:', error)
    throw error
  }
}