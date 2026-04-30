import {
  createPaymentRequest, getRequestsByLandlord, getRequestsByTenant,
  getRequestsByRental, updateRequestStatus, deleteRequest,
  getPaymentChartData, getRentalPaymentSummary
} from '../models/paymentRequestModel.js'
import { NOTIF } from '../utils/notify.js'
import pool from '../config/db.js'

export const createRequest = async (req, res) => {
  try {
    const { rental_id, amount, due_date, month_year, note } = req.body

    if (!rental_id || !amount || !due_date || !month_year) {
      return res.status(400).json({ message: 'rental_id, amount, due_date and month_year are required' })
    }

    const [rentals] = await pool.query(
      `SELECT r.*, p.landlord_id, r.tenant_id, p.title as property_title
       FROM rentals r 
       JOIN properties p ON r.property_id = p.id 
       WHERE r.id = ? AND p.landlord_id = ?`,
      [rental_id, req.user.id]
    )

    if (!rentals[0]) {
      return res.status(403).json({ message: 'Not authorized or rental not found' })
    }
    if (rentals[0].status !== 'active') {
      return res.status(400).json({ message: 'Rental is not active' })
    }

    const id = await createPaymentRequest({
      rental_id,
      landlord_id: req.user.id,
      tenant_id: rentals[0].tenant_id,
      amount,
      due_date,
      month_year,
      note
    })

    // Notify tenant
    try {
      await NOTIF.paymentRequested(
        rentals[0].tenant_id,
        month_year,
        amount,
        rentals[0].property_title
      )
    } catch (err) {
      console.error('Notification failed:', err.message)
    }

    res.status(201).json({ message: 'Payment request created successfully', id })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const landlordRequests = async (req, res) => {
  try {
    const requests = await getRequestsByLandlord(req.user.id)
    res.json({ count: requests.length, requests })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const tenantRequests = async (req, res) => {
  try {
    const requests = await getRequestsByTenant(req.user.id)
    res.json({ count: requests.length, requests })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const rentalRequests = async (req, res) => {
  try {
    const requests = await getRequestsByRental(req.params.rentalId)
    const summary = await getRentalPaymentSummary(req.params.rentalId)
    const chartData = await getPaymentChartData(req.params.rentalId)
    res.json({ requests, summary, chartData })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['pending', 'paid', 'overdue'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    // Get full request details
    const [requests] = await pool.query(
      `SELECT pr.*, r.tenant_id, p.landlord_id, p.title as property_title
       FROM payment_requests pr
       JOIN rentals r ON pr.rental_id = r.id
       JOIN properties p ON r.property_id = p.id
       WHERE pr.id = ?`,
      [req.params.id]
    )

    if (!requests[0]) {
      return res.status(404).json({ message: 'Payment request not found' })
    }

    const pr = requests[0]

    if (pr.landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await updateRequestStatus(req.params.id, status)

    // If marked as paid — auto create payment record
    if (status === 'paid') {
      await pool.query(
        `INSERT INTO payments (rental_id, amount, payment_date, method, status, notes)
         VALUES (?, ?, CURDATE(), 'cash', 'paid', ?)`,
        [pr.rental_id, pr.amount, `${pr.month_year} — Auto from payment request`]
      )

      try {
        await NOTIF.paymentRecorded(pr.tenant_id, pr.amount, pr.property_title)
      } catch (err) {
        console.error('Notification failed:', err.message)
      }
    }

    if (status === 'overdue') {
      try {
        await NOTIF.paymentOverdue(pr.tenant_id, pr.month_year, pr.property_title)
      } catch (err) {
        console.error('Notification failed:', err.message)
      }
    }

    res.json({ message: `Payment request marked as ${status}` })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deletePaymentRequest = async (req, res) => {
  try {
    const affected = await deleteRequest(req.params.id, req.user.id)
    if (!affected) {
      return res.status(404).json({ message: 'Request not found or not authorized' })
    }
    res.json({ message: 'Payment request deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}