import express from 'express'
import {
  recordPayment, rentalPayments, landlordPayments,
  tenantPayments, paymentSummary, monthlyReport, updateStatus
} from '../controllers/paymentController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'

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
 *       400:
 *         description: Validation error
 */
router.post('/', protect, allowRoles('landlord', 'admin'), recordPayment)

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