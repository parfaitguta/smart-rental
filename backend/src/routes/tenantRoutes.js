import express from 'express'
import {
  getMyTenants, getTenantDetail, addNote,
  updateStatus, terminateTenancy, deleteNote,
  getLandlordTenants, getMonthlyBreakdown
} from '../controllers/tenantController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Get all tenants for landlord
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tenants
 */
router.get('/', protect, allowRoles('landlord', 'admin'), getMyTenants)

/**
 * @swagger
 * /api/tenants/landlord:
 *   get:
 *     summary: Get all tenants for landlord (mobile app)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tenants with properties
 */
router.get('/landlord', protect, allowRoles('landlord', 'admin'), getLandlordTenants)

/**
 * @swagger
 * /api/tenants/rental/{rentalId}/monthly-breakdown:
 *   get:
 *     summary: Get monthly payment breakdown for a rental
 *     tags: [Tenants]
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
 *         description: Monthly payment breakdown
 */
router.get('/rental/:rentalId/monthly-breakdown', protect, allowRoles('landlord', 'admin', 'tenant'), getMonthlyBreakdown)

/**
 * @swagger
 * /api/tenants/{rentalId}:
 *   get:
 *     summary: Get full tenant details
 *     tags: [Tenants]
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
 *         description: Tenant details with payments and notes
 */
router.get('/:rentalId', protect, allowRoles('landlord', 'admin'), getTenantDetail)

/**
 * @swagger
 * /api/tenants/{rentalId}/notes:
 *   post:
 *     summary: Add note about tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rentalId
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
 *               note:
 *                 type: string
 *                 example: Tenant paid on time this month
 *               type:
 *                 type: string
 *                 enum: [general, warning, compliment, issue]
 *                 example: general
 *     responses:
 *       201:
 *         description: Note added
 */
router.post('/:rentalId/notes', protect, allowRoles('landlord', 'admin'), addNote)

/**
 * @swagger
 * /api/tenants/{rentalId}/status:
 *   put:
 *     summary: Update tenant status
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rentalId
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
 *               tenant_status:
 *                 type: string
 *                 enum: [good, warning, problematic]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/:rentalId/status', protect, allowRoles('landlord', 'admin'), updateStatus)

/**
 * @swagger
 * /api/tenants/{rentalId}/terminate:
 *   put:
 *     summary: Terminate tenancy with reason
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rentalId
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
 *               reason:
 *                 type: string
 *                 example: Tenant violated rental agreement terms
 *     responses:
 *       200:
 *         description: Tenancy terminated
 */
router.put('/:rentalId/terminate', protect, allowRoles('landlord', 'admin'), terminateTenancy)

/**
 * @swagger
 * /api/tenants/notes/{noteId}:
 *   delete:
 *     summary: Delete a tenant note
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Note deleted
 */
router.delete('/notes/:noteId', protect, allowRoles('landlord', 'admin'), deleteNote)

export default router