import express from 'express'
import { send, getConversations, getChat, unreadCount } from '../controllers/messageController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_id
 *               - message
 *             properties:
 *               receiver_id:
 *                 type: integer
 *                 example: 1
 *               property_id:
 *                 type: integer
 *                 example: 2
 *               message:
 *                 type: string
 *                 example: Hello, is this property still available?
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/', protect, send)

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get all conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations', protect, getConversations)

/**
 * @swagger
 * /api/messages/unread:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/unread', protect, unreadCount)

/**
 * @swagger
 * /api/messages/{userId}:
 *   get:
 *     summary: Get conversation with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chat messages
 */
router.get('/:userId', protect, getChat)

export default router