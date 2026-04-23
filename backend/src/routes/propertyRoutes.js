import express from 'express'
import {
  addProperty, listProperties, getProperty,
  myProperties, editProperty, removeProperty
} from '../controllers/propertyController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Browse all available properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         example: Kigali
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         example: Gasabo
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         example: 50000
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         example: 200000
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/', listProperties)

/**
 * @swagger
 * /api/properties/my:
 *   get:
 *     summary: Get landlord's own properties
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of landlord properties
 */
router.get('/my', protect, allowRoles('landlord', 'admin'), myProperties)

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get a single property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Property not found
 */
router.get('/:id', getProperty)

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Add a new property (landlord only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - province
 *               - district
 *             properties:
 *               title:
 *                 type: string
 *                 example: Modern apartment in Kacyiru
 *               description:
 *                 type: string
 *                 example: 2 bedroom apartment with parking
 *               price:
 *                 type: number
 *                 example: 150000
 *               province:
 *                 type: string
 *                 example: Kigali
 *               district:
 *                 type: string
 *                 example: Gasabo
 *               sector:
 *                 type: string
 *                 example: Kacyiru
 *               cell:
 *                 type: string
 *                 example: Kamutwa
 *               village:
 *                 type: string
 *                 example: Gasanze
 *               latitude:
 *                 type: number
 *                 example: -1.9441
 *               longitude:
 *                 type: number
 *                 example: 30.0619
 *     responses:
 *       201:
 *         description: Property added successfully
 *       400:
 *         description: Validation error
 */
router.post('/', protect, allowRoles('landlord', 'admin'), addProperty)

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property (landlord only)
 *     tags: [Properties]
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
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, rented, inactive]
 *     responses:
 *       200:
 *         description: Property updated
 *       404:
 *         description: Property not found
 */
router.put('/:id', protect, allowRoles('landlord', 'admin'), editProperty)

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property (landlord only)
 *     tags: [Properties]
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
 *       404:
 *         description: Property not found
 */
router.delete('/:id', protect, allowRoles('landlord', 'admin'), removeProperty)

export default router