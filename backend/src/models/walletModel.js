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
    
    let newBalance = wallet.balance
    let newTotalEarned = wallet.total_earned
    let newTotalWithdrawn = wallet.total_withdrawn
    
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
        type === 'credit' ? 'Rent payment received' : 'Withdrawal request'
      ]
    )
    
    return { balance: newBalance, total_earned: newTotalEarned, total_withdrawn: newTotalWithdrawn }
  } catch (error) {
    console.error('Error updating wallet:', error)
    throw error
  }
}

// Create withdrawal request
export const createWithdrawalRequest = async (landlordId, amount, phone, method) => {
  try {
    const wallet = await getOrCreateWallet(landlordId)
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance')
    }
    
    const [result] = await pool.query(
      `INSERT INTO withdrawal_requests (landlord_id, amount, phone, method, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [landlordId, amount, phone, method]
    )
    
    return { id: result.insertId, amount, status: 'pending' }
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

// Process withdrawal (admin only)
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
    
    await pool.query(
      `UPDATE withdrawal_requests 
       SET status = ?, processed_by = ?, processed_at = NOW()
       WHERE id = ?`,
      [status, adminId, requestId]
    )
    
    if (status === 'completed') {
      // Deduct from wallet (already deducted when request was created, but ensure it's done)
      await updateWalletBalance(withdrawal.landlord_id, withdrawal.amount, 'debit')
    }
    
    return { success: true, status }
  } catch (error) {
    console.error('Error processing withdrawal:', error)
    throw error
  }
}