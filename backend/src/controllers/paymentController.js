import {
  createPayment, getPaymentById, getPaymentsByRental,
  getPaymentsByLandlord, getPaymentsByTenant,
  getLandlordSummary, getMonthlyReport, updatePaymentStatus
} from '../models/paymentModel.js'
import { getRentalById } from '../models/rentalModel.js'
import { NOTIF } from '../utils/notify.js'

export const recordPayment = async (req, res) => {
  try {
    const { rental_id, amount, payment_date, method, status, notes } = req.body

    if (!rental_id || !amount || !payment_date || !method) {
      return res.status(400).json({ message: 'rental_id, amount, payment_date and method are required' })
    }

    const rental = await getRentalById(rental_id)
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' })
    }
    if (rental.landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to record payment for this rental' })
    }
    if (rental.status !== 'active') {
      return res.status(400).json({ message: 'Cannot record payment for an inactive rental' })
    }

    const id = await createPayment({ rental_id, amount, payment_date, method, status, notes })
    const payment = await getPaymentById(id)

    // Notify tenant
    try {
      await NOTIF.paymentRecorded(rental.tenant_id, amount, rental.property_title)
    } catch (notifErr) {
      console.error('Notification failed:', notifErr.message)
    }

    res.status(201).json({ message: 'Payment recorded successfully', payment })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const renterMakePayment = async (req, res) => {
  try {
    const { rental_id, amount, month_year, payment_method } = req.body
    const tenantId = req.user.id

    if (!rental_id || !amount) {
      return res.status(400).json({ message: 'rental_id and amount are required' })
    }

    // Verify rental belongs to this tenant
    const rental = await getRentalById(rental_id)
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' })
    }
    if (rental.tenant_id !== tenantId) {
      return res.status(403).json({ message: 'Not authorized to pay for this rental' })
    }
    if (rental.status !== 'active') {
      return res.status(400).json({ message: 'Cannot pay for an inactive rental' })
    }

    // Create payment
    const paymentDate = new Date().toISOString().split('T')[0]
    const paymentId = await createPayment({
      rental_id,
      amount,
      payment_date: paymentDate,
      method: payment_method || 'mobile_money',
      status: 'paid',
      notes: `Payment for ${month_year || new Date().toLocaleDateString()}`
    })

    const payment = await getPaymentById(paymentId)

    // Notify landlord
    try {
      const landlordId = rental.landlord_id
      await NOTIF.paymentReceived(landlordId, amount, rental.property_title, rental.tenant_name)
    } catch (notifErr) {
      console.error('Notification failed:', notifErr.message)
    }

    res.status(201).json({
      success: true,
      id: paymentId,
      message: 'Payment successful',
      payment
    })
  } catch (error) {
    console.error('Payment error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const rentalPayments = async (req, res) => {
  try {
    const rental = await getRentalById(req.params.rental_id)
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' })
    }
    if (rental.landlord_id !== req.user.id && rental.tenant_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view these payments' })
    }
    const payments = await getPaymentsByRental(req.params.rental_id)
    res.json({ count: payments.length, payments })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const landlordPayments = async (req, res) => {
  try {
    const payments = await getPaymentsByLandlord(req.user.id)
    res.json({ count: payments.length, payments })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const tenantPayments = async (req, res) => {
  try {
    const payments = await getPaymentsByTenant(req.user.id)
    res.json({ count: payments.length, payments })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const paymentSummary = async (req, res) => {
  try {
    const summary = await getLandlordSummary(req.user.id)
    res.json({ summary })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const monthlyReport = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear()
    const report = await getMonthlyReport(req.user.id, year)
    const total = report.reduce((sum, row) => sum + parseFloat(row.total_received), 0)
    res.json({
      year,
      total_annual_income: total,
      monthly_breakdown: report
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['paid', 'pending', 'overdue'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use: paid, pending, or overdue' })
    }
    const payment = await getPaymentById(req.params.id)
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }
    if (payment.landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this payment' })
    }
    await updatePaymentStatus(req.params.id, status)
    res.json({ message: `Payment status updated to ${status}` })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}