import express from 'express'
import { sendRentReminders, sendCustomSMS, getSMSStats } from '../controllers/smsController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/reminders', protect, allowRoles('admin', 'landlord'), sendRentReminders)
router.post('/send', protect, allowRoles('admin'), sendCustomSMS)
router.get('/stats', protect, allowRoles('admin', 'landlord'), getSMSStats)

export default router