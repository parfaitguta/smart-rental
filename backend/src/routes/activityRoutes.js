import express from 'express'
import {
  myActivity, allActivity, activityByType,
  activityStats, clearLogs
} from '../controllers/activityController.js'
import { protect, allowRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/my', protect, myActivity)
router.get('/all', protect, allowRoles('admin'), allActivity)
router.get('/stats', protect, allowRoles('admin'), activityStats)
router.get('/type/:type', protect, allowRoles('admin'), activityByType)
router.delete('/clear', protect, allowRoles('admin'), clearLogs)

export default router