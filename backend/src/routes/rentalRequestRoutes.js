import express from 'express'
import {
  sendRequest, landlordRequests, renterRequests,
  acceptRequest, rejectRequest
} from '../controllers/rentalRequestController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Send a rental request (renter only)
 *     tags: [Rental Requests]
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
 *             properties:
 *               property_id:
 *                 type: integer
 *                 example: 1
 *               message:
 *                 type: string
 *                 example: I am interested in this property, available to move in next week
 *     responses:
 *       201:
 *         description: Request sent successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Property not found
 */
router.post('/', protect, allowRoles('renter'), sendRequest)

/**
 * @swagger
 * /api/requests/landlord:
 *   get:
 *     summary: Get all requests on landlord properties
 *     tags: [Rental Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rental requests
 */
router.get('/landlord', protect, allowRoles('landlord', 'admin'), landlordRequests)

/**
 * @swagger
 * /api/requests/renter:
 *   get:
 *     summary: Get renter's own requests
 *     tags: [Rental Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of renter requests
 */
router.get('/renter', protect, allowRoles('renter'), renterRequests)

/**
 * @swagger
 * /api/requests/{id}/accept:
 *   put:
 *     summary: Accept a rental request (landlord only)
 *     tags: [Rental Requests]
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
 *         description: Request accepted
 *       404:
 *         description: Request not found
 */
router.put('/:id/accept', protect, allowRoles('landlord', 'admin'), acceptRequest)

/**
 * @swagger
 * /api/requests/{id}/reject:
 *   put:
 *     summary: Reject a rental request (landlord only)
 *     tags: [Rental Requests]
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
 *         description: Request rejected
 *       404:
 *         description: Request not found
 */
router.put('/:id/reject', protect, allowRoles('landlord', 'admin'), rejectRequest)

export default router