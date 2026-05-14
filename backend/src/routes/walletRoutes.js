// backend/src/routes/walletRoutes.js
import express from 'express'
import { protect, allowRoles } from '../middleware/authMiddleware.js'
import {
  getOrCreateWallet,
  updateWalletBalance,
  createWithdrawalRequest,
  getWithdrawalRequests,
  getTransactionHistory,
  processWithdrawal
} from '../models/walletModel.js'
import pool from '../config/db.js'

const router = express.Router()

// Get wallet balance
router.get('/balance', protect, allowRoles('landlord'), async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user.id)
    res.json({
      success: true,
      balance: wallet.balance,
      total_earned: wallet.total_earned,
      total_withdrawn: wallet.total_withdrawn
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get transaction history
router.get('/transactions', protect, allowRoles('landlord'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const transactions = await getTransactionHistory(req.user.id, limit)
    res.json({ success: true, transactions })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get withdrawal requests
router.get('/withdrawals', protect, allowRoles('landlord'), async (req, res) => {
  try {
    const withdrawals = await getWithdrawalRequests(req.user.id)
    res.json({ success: true, withdrawals })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Create withdrawal request
router.post('/withdraw', protect, allowRoles('landlord'), async (req, res) => {
  try {
    const { amount, phone, method } = req.body
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' })
    }
    
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number required' })
    }
    
    const wallet = await getOrCreateWallet(req.user.id)
    
    if (wallet.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Available: RWF ${wallet.balance}` 
      })
    }
    
    const withdrawal = await createWithdrawalRequest(req.user.id, amount, phone, method)
    
    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Admin: Get all withdrawal requests
router.get('/admin/withdrawals', protect, allowRoles('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.*, u.full_name, u.email, u.phone as user_phone
       FROM withdrawal_requests w
       JOIN users u ON w.landlord_id = u.id
       ORDER BY w.created_at DESC`
    )
    res.json({ success: true, withdrawals: rows })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Admin: Process withdrawal
router.put('/admin/withdrawals/:id', protect, allowRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const result = await processWithdrawal(id, status, req.user.id)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router