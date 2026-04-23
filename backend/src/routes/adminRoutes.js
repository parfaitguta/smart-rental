import express from 'express'
import {
  getPlatformStats, getAllUsers, getUserById, changeUserRole, deleteUser,
  getAllProperties, deleteProperty, getAllRentals, getAllPayments, getAllRequests
} from '../controllers/adminController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(protect)
router.use(allowRoles('admin'))

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get full platform statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform stats
 */
router.get('/stats', getPlatformStats)

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/users', getAllUsers)

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Admin]
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
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/users/:id', getUserById)

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Change a user's role
 *     tags: [Admin]
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
 *               role:
 *                 type: string
 *                 enum: [renter, landlord, admin]
 *                 example: landlord
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put('/users/:id/role', changeUserRole)

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
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
 *         description: User deleted
 */
router.delete('/users/:id', deleteUser)

/**
 * @swagger
 * /api/admin/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all properties
 */
router.get('/properties', getAllProperties)

/**
 * @swagger
 * /api/admin/properties/{id}:
 *   delete:
 *     summary: Delete any property
 *     tags: [Admin]
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
 *         description: Property deleted
 */
router.delete('/properties/:id', deleteProperty)

/**
 * @swagger
 * /api/admin/rentals:
 *   get:
 *     summary: Get all rentals
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all rentals
 */
router.get('/rentals', getAllRentals)

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all payments
 */
router.get('/payments', getAllPayments)

/**
 * @swagger
 * /api/admin/requests:
 *   get:
 *     summary: Get all rental requests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all requests
 */
router.get('/requests', getAllRequests)

export default router