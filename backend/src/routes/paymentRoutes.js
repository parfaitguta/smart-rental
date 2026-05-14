import express from 'express'
import {
  recordPayment, rentalPayments, landlordPayments,
  tenantPayments, paymentSummary, monthlyReport, updateStatus,
  renterMakePayment
} from '../controllers/paymentController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'
import pool from '../config/db.js'
import paypack, { formatPhoneForPaypack } from '../config/paypack.js'

const router = express.Router()

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Record a rent payment (landlord only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rental_id
 *               - amount
 *               - payment_date
 *               - method
 *             properties:
 *               rental_id:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 150000
 *               payment_date:
 *                 type: string
 *                 example: "2026-05-01"
 *               method:
 *                 type: string
 *                 enum: [cash, mtn_momo, airtel_money]
 *                 example: mtn_momo
 *               status:
 *                 type: string
 *                 enum: [paid, pending, overdue]
 *                 example: paid
 *               notes:
 *                 type: string
 *                 example: May rent payment
 *     responses:
 *       201:
 *         description: Payment recorded
 */
router.post('/', protect, allowRoles('landlord', 'admin'), recordPayment)

/**
 * @swagger
 * /api/payments/renter-pay:
 *   post:
 *     summary: Make a payment as renter
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rental_id
 *               - amount
 *             properties:
 *               rental_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *               month_year:
 *                 type: string
 *               payment_method:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment successful
 */
router.post('/renter-pay', protect, allowRoles('renter'), renterMakePayment)

// DEBUG: Check paypack methods
router.get('/debug-paypack', async (req, res) => {
  try {
    const paypackModule = await import('../config/paypack.js')
    const paypack = paypackModule.default
    
    res.json({
      methods: Object.keys(paypack),
      has_cashin: typeof paypack.cashin === 'function',
      has_auth: typeof paypack.auth === 'function',
      has_status: typeof paypack.status === 'function',
      mode: process.env.PAYPACK_MODE || 'live'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/payments/invoices/{id}/pay:
 *   post:
 *     summary: Pay an invoice directly (renter only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - phone
 *               - method
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 150000
 *               phone:
 *                 type: string
 *                 example: "0788888888"
 *               method:
 *                 type: string
 *                 enum: [mtn_momo, airtel_money]
 *                 example: mtn_momo
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *       400:
 *         description: Payment failed
 *       404:
 *         description: Invoice not found
 */
router.post('/invoices/:id/pay', protect, allowRoles('renter'), async (req, res) => {
  try {
    const { id } = req.params
    const { amount, phone, method } = req.body

    console.log(`Processing payment for invoice ${id} by user ${req.user.id}`)

    // Get invoice details with rental and property information
    const [invoices] = await pool.query(
      `SELECT 
        i.*, 
        r.id as rental_id, 
        r.landlord_id,
        r.property_id,
        p.title as property_title,
        p.landlord_id as property_landlord_id,
        u.full_name as landlord_name,
        u.phone as landlord_phone
       FROM invoices i 
       JOIN rentals r ON i.rental_id = r.id 
       JOIN properties p ON r.property_id = p.id
       JOIN users u ON p.landlord_id = u.id
       WHERE i.id = ? AND i.tenant_id = ?`,
      [id, req.user.id]
    )

    if (invoices.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found or you are not authorized to pay this invoice' 
      })
    }

    const invoice = invoices[0]

    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Invoice is already paid' })
    }

    if (invoice.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Invoice has been cancelled' })
    }

    const remainingAmount = parseFloat(invoice.remaining) || (invoice.amount - invoice.amount_paid)
    const payAmount = amount || remainingAmount

    if (payAmount > remainingAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Amount cannot exceed remaining balance of ${remainingAmount}` 
      })
    }

    const formattedPhone = formatPhoneForPaypack(phone)
    if (!formattedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid Rwanda mobile money number (e.g. 078… or 25078…).'
      })
    }

    console.log(`Processing ${method} payment of ${payAmount} from phone ${formattedPhone}`)

    let paymentResult = null

    try {
      if (typeof paypack.cashin !== 'function') {
        throw new Error('PayPack cashin is not available')
      }

      paymentResult = await paypack.cashin({
        amount: payAmount,
        number: formattedPhone,
        mode: process.env.PAYPACK_MODE || 'live'
      })

      console.log('PayPack payment result:', paymentResult)

      if (!paymentResult?.success) {
        await pool.query(
          `INSERT INTO payments (
            rental_id, amount, payment_date, method, status,
            notes, created_by, invoice_id, error_message
          ) VALUES (?, ?, NOW(), ?, 'failed', ?, ?, ?, ?)`,
          [
            invoice.rental_id,
            payAmount,
            method,
            `Failed payment for invoice ${id}: ${paymentResult?.error || 'Paypack rejected cashin'}`,
            req.user.id,
            id,
            paymentResult?.error || 'Paypack rejected cashin'
          ]
        )

        return res.status(400).json({
          success: false,
          message: paymentResult?.error || 'Payment could not be started. Nothing was sent to the phone.',
          details: paymentResult?.details
        })
      }

      // Record payment in database
      const [paymentInsert] = await pool.query(
        `INSERT INTO payments (
          rental_id, amount, payment_date, method, status, 
          reference_id, notes, created_by, invoice_id
        ) VALUES (?, ?, NOW(), ?, 'pending', ?, ?, ?, ?)`,
        [
          invoice.rental_id, 
          payAmount, 
          method, 
          paymentResult.data.ref,
          `Payment for invoice ${id}`,
          req.user.id,
          id
        ]
      )

      // Update invoice amount paid and remaining
      const newAmountPaid = parseFloat(invoice.amount_paid || 0) + payAmount
      const newRemaining = invoice.amount - newAmountPaid
      const newStatus = newAmountPaid >= invoice.amount ? 'paid' : 
                        newAmountPaid > 0 ? 'partial' : 'unpaid'

      await pool.query(
        `UPDATE invoices 
         SET amount_paid = ?, remaining = ?, status = ? 
         WHERE id = ?`,
        [newAmountPaid, newRemaining, newStatus, id]
      )

      res.json({
        success: true,
        message:
          paymentResult.sandbox || process.env.PAYPACK_MODE === 'sandbox'
            ? 'Sandbox: no prompt is sent to the phone. Use live mode for a real MoMo confirmation.'
            : 'Payment initiated! Check your phone to confirm.',
        payment_id: paymentInsert.insertId,
        transaction_id: paymentResult.data.ref,
        remaining: newRemaining,
        status: newStatus,
        sandbox: !!(paymentResult.sandbox || process.env.PAYPACK_MODE === 'sandbox')
      })

    } catch (error) {
      console.error('PayPack payment error:', error)
      
      await pool.query(
        `INSERT INTO payments (
          rental_id, amount, payment_date, method, status, 
          notes, created_by, invoice_id, error_message
        ) VALUES (?, ?, NOW(), ?, 'failed', ?, ?, ?, ?)`,
        [
          invoice.rental_id,
          payAmount,
          method,
          `Failed payment for invoice ${id}: ${error.message}`,
          req.user.id,
          id,
          error.message
        ]
      )

      res.status(400).json({
        success: false,
        message: error.message || 'Payment failed. Please try again.'
      })
    }

  } catch (error) {
    console.error('Payment route error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error processing payment',
      error: error.message
    })
  }
})

/**
 * @swagger
 * /api/payments/summary:
 *   get:
 *     summary: Get landlord financial summary
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary
 */
router.get('/summary', protect, allowRoles('landlord', 'admin'), paymentSummary)

/**
 * @swagger
 * /api/payments/report:
 *   get:
 *     summary: Get monthly income report
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         example: 2026
 *     responses:
 *       200:
 *         description: Monthly report
 */
router.get('/report', protect, allowRoles('landlord', 'admin'), monthlyReport)

/**
 * @swagger
 * /api/payments/landlord:
 *   get:
 *     summary: Get all payments for landlord
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get('/landlord', protect, allowRoles('landlord', 'admin'), landlordPayments)

/**
 * @swagger
 * /api/payments/rental-summary:
 *   get:
 *     summary: Get rental payment summary with remaining balances
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rentals with payment summary
 */
router.get('/rental-summary', protect, allowRoles('landlord', 'admin'), async (req, res) => {
  try {
    const [rentals] = await pool.query(
      `SELECT
        r.id as rental_id,
        p.title as property_title,
        u.full_name as tenant_name,
        r.monthly_rent,
        COALESCE(SUM(pay.amount), 0) as total_paid,
        r.monthly_rent - COALESCE(SUM(pay.amount), 0) as remaining_balance
       FROM rentals r
       JOIN properties p ON r.property_id = p.id
       JOIN users u ON r.tenant_id = u.id
       LEFT JOIN payments pay ON r.id = pay.rental_id AND pay.status = 'paid'
       WHERE p.landlord_id = ?
       GROUP BY r.id, p.title, u.full_name, r.monthly_rent
       ORDER BY remaining_balance DESC`,
      [req.user.id]
    )

    res.json({ rentals: rentals })
  } catch (error) {
    console.error('Error getting rental summary:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

/**
 * @swagger
 * /api/payments/tenant:
 *   get:
 *     summary: Get tenant payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenant payment history
 */
router.get('/tenant', protect, allowRoles('renter'), tenantPayments)

/**
 * @swagger
 * /api/payments/rental/{rental_id}:
 *   get:
 *     summary: Get all payments for a specific rental
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rental_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payments for rental
 */
router.get('/rental/:rental_id', protect, rentalPayments)

/**
 * @swagger
 * /api/payments/{id}/status:
 *   put:
 *     summary: Update payment status (landlord only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [paid, pending, overdue]
 *                 example: paid
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/:id/status', protect, allowRoles('landlord', 'admin'), updateStatus)

export default router