import express from 'express'
import {
  getNotifications, getUnread, readOne,
  readAll, removeOne, clearAll
} from '../controllers/notificationController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getNotifications)
router.get('/unread-count', protect, getUnread)
router.put('/read-all', protect, readAll)
router.delete('/clear-all', protect, clearAll)
router.put('/:id/read', protect, readOne)
router.delete('/:id', protect, removeOne)

export default router