import express from 'express'
import {
  submitReview, propertyReviews, myReviews,
  landlordReviews, removeReview
} from '../controllers/reviewController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Submit a property review (renter only)
 *     tags: [Reviews]
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
 *               - rental_id
 *               - rating
 *             properties:
 *               property_id:
 *                 type: integer
 *                 example: 1
 *               rental_id:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: integer
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Great property, very clean and spacious!
 *     responses:
 *       201:
 *         description: Review submitted
 */
router.post('/', protect, allowRoles('renter'), submitReview)

/**
 * @swagger
 * /api/reviews/property/{id}:
 *   get:
 *     summary: Get reviews for a property
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reviews and rating
 */
router.get('/property/:id', propertyReviews)

/**
 * @swagger
 * /api/reviews/my:
 *   get:
 *     summary: Get renter's own reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Renter reviews
 */
router.get('/my', protect, allowRoles('renter'), myReviews)

/**
 * @swagger
 * /api/reviews/landlord:
 *   get:
 *     summary: Get reviews on landlord properties
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Landlord reviews
 */
router.get('/landlord', protect, allowRoles('landlord', 'admin'), landlordReviews)

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
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
 *         description: Review deleted
 */
router.delete('/:id', protect, allowRoles('renter'), removeReview)

export default router