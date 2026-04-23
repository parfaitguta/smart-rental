import express from 'express'
import { uploadImages, getPropertyImages, deleteImage, setPrimaryImage } from '../controllers/imageController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'
import upload from '../config/multer.js'

const router = express.Router()

/**
 * @swagger
 * /api/images/{propertyId}:
 *   post:
 *     summary: Upload images for a property (landlord only)
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Images uploaded
 */
router.post('/:propertyId', protect, allowRoles('landlord', 'admin'), upload.array('images', 5), uploadImages)

/**
 * @swagger
 * /api/images/{propertyId}:
 *   get:
 *     summary: Get all images for a property
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of images
 */
router.get('/:propertyId', getPropertyImages)

/**
 * @swagger
 * /api/images/delete/{imageId}:
 *   delete:
 *     summary: Delete an image (landlord only)
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Image deleted
 */
router.delete('/delete/:imageId', protect, allowRoles('landlord', 'admin'), deleteImage)

/**
 * @swagger
 * /api/images/{imageId}/primary:
 *   put:
 *     summary: Set image as primary (landlord only)
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Primary image updated
 */
router.put('/:imageId/primary', protect, allowRoles('landlord', 'admin'), setPrimaryImage)

export default router