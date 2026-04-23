import express from 'express'
import {
  createRentalAgreement, getLandlordRentals,
  getTenantRentals, getRentalDetail, terminateRental
} from '../controllers/rentalController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/rentals:
 *   post:
 *     summary: Create a rental agreement (landlord only)
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - property_id
 *               - tenant_id
 *               - start_date
 *               - monthly_rent
 *             properties:
 *               property_id:
 *                 type: integer
 *                 example: 1
 *               tenant_id:
 *                 type: integer
 *                 example: 3
 *               start_date:
 *                 type: string
 *                 example: "2026-05-01"
 *               end_date:
 *                 type: string
 *                 example: "2027-04-30"
 *               monthly_rent:
 *                 type: number
 *                 example: 150000
 *     responses:
 *       201:
 *         description: Rental agreement created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 */
router.post('/', protect, allowRoles('landlord', 'admin'), createRentalAgreement)

/**
 * @swagger
 * /api/rentals/landlord:
 *   get:
 *     summary: Get all rentals for landlord
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rentals
 */
router.get('/landlord', protect, allowRoles('landlord', 'admin'), getLandlordRentals)

/**
 * @swagger
 * /api/rentals/tenant:
 *   get:
 *     summary: Get tenant's own rentals
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tenant rentals
 */
router.get('/tenant', protect, allowRoles('renter'), getTenantRentals)

/**
 * @swagger
 * /api/rentals/{id}:
 *   get:
 *     summary: Get a single rental detail
 *     tags: [Rentals]
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
 *         description: Rental details
 *       404:
 *         description: Rental not found
 */
router.get('/:id', protect, getRentalDetail)

/**
 * @swagger
 * /api/rentals/{id}/terminate:
 *   put:
 *     summary: Terminate a rental agreement (landlord only)
 *     tags: [Rentals]
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
 *         description: Rental terminated
 *       404:
 *         description: Rental not found
 */
router.put('/:id/terminate', protect, allowRoles('landlord', 'admin'), terminateRental)

export default router