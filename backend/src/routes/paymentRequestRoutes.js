import express from 'express'
import {
  createRequest, landlordRequests, tenantRequests,
  rentalRequests, updateStatus, deletePaymentRequest
} from '../controllers/paymentRequestController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/payment-requests:
 *   post:
 *     summary: Create a payment request (landlord only)
 *     tags: [Payment Requests]
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
 *               - due_date
 *               - month_year
 *             properties:
 *               rental_id:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 150000
 *               due_date:
 *                 type: string
 *                 example: "2026-05-01"
 *               month_year:
 *                 type: string
 *                 example: "May 2026"
 *               note:
 *                 type: string
 *                 example: Please pay before the 5th
 *     responses:
 *       201:
 *         description: Payment request created
 */
router.post('/', protect, allowRoles('landlord', 'admin'), createRequest)

/**
 * @swagger
 * /api/payment-requests/landlord:
 *   get:
 *     summary: Get all payment requests by landlord
 *     tags: [Payment Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payment requests
 */
router.get('/landlord', protect, allowRoles('landlord', 'admin'), landlordRequests)

/**
 * @swagger
 * /api/payment-requests/tenant:
 *   get:
 *     summary: Get tenant payment requests
 *     tags: [Payment Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payment requests
 */
router.get('/tenant', protect, allowRoles('renter'), tenantRequests)

/**
 * @swagger
 * /api/payment-requests/rental/{rentalId}:
 *   get:
 *     summary: Get payment requests and chart data for a rental
 *     tags: [Payment Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rentalId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Requests, summary and chart data
 */
router.get('/rental/:rentalId', protect, rentalRequests)

/**
 * @swagger
 * /api/payment-requests/{id}/status:
 *   put:
 *     summary: Update payment request status
 *     tags: [Payment Requests]
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
 *                 enum: [pending, paid, overdue]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/:id/status', protect, allowRoles('landlord', 'admin'), updateStatus)

/**
 * @swagger
 * /api/payment-requests/{id}:
 *   delete:
 *     summary: Delete a payment request
 *     tags: [Payment Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', protect, allowRoles('landlord', 'admin'), deletePaymentRequest)

export default router