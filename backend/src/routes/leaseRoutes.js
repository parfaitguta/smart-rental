import express from 'express'
import { generateLease } from '../controllers/leaseController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/lease/{rentalId}:
 *   get:
 *     summary: Generate lease agreement PDF
 *     tags: [Lease]
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
 *         description: PDF lease agreement
 */
router.get('/:rentalId', protect, generateLease)

export default router