import express from 'express'
import {
  createNewInvoice,
  tenantInvoices,
  landlordInvoices,
  getInvoice,
  payInvoice,
  paypackWebhook,
  verifyPayment,
  testPaypackConnection,
  getRentalPaymentHistory,
  getMyPayments,
  getLandlordPaymentsAll,
  getCurrentMonthStatus
} from '../controllers/invoiceController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public webhook endpoint (no auth required)
router.post('/webhook', paypackWebhook)

// Public test endpoint
router.get('/test-paypack', testPaypackConnection)

// Protected routes (require authentication)
router.route('/')
  .post(protect, createNewInvoice)

router.get('/tenant', protect, tenantInvoices)
router.get('/landlord', protect, landlordInvoices)
router.get('/my-payments', protect, getMyPayments)
router.get('/landlord-payments', protect, getLandlordPaymentsAll)

router.post('/verify', protect, verifyPayment)

router.get('/rental/:rental_id/payment-history', protect, getRentalPaymentHistory)
router.get('/rental/:rental_id/current-status', protect, getCurrentMonthStatus)

router.route('/:id')
  .get(protect, getInvoice)

router.post('/:id/pay', protect, payInvoice)

export default router