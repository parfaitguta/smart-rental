import express from 'express'
import { generateReceipt, generateRequestReceipt } from '../controllers/receiptController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/request/:id', protect, generateRequestReceipt)
router.get('/:paymentId', protect, generateReceipt)

export default router