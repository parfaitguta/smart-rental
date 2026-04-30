import pool from '../config/db.js'
import { generateReceiptPDF } from '../utils/generateReceipt.js'

export const generateReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params

    const [payments] = await pool.query(
      `SELECT 
         pay.*,
         r.start_date as rental_start,
         r.monthly_rent,
         r.tenant_id,
         r.property_id,
         tenant.full_name as tenant_name,
         tenant.phone as tenant_phone,
         landlord.full_name as landlord_name,
         landlord.phone as landlord_phone,
         p.title as property_title,
         p.district, p.province, p.sector,
         p.landlord_id
       FROM payments pay
       JOIN rentals r ON pay.rental_id = r.id
       JOIN users tenant ON r.tenant_id = tenant.id
       JOIN properties p ON r.property_id = p.id
       JOIN users landlord ON p.landlord_id = landlord.id
       WHERE pay.id = ?`,
      [paymentId]
    )

    if (!payments[0]) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    const pay = payments[0]

    if (pay.landlord_id !== req.user.id && pay.tenant_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this receipt' })
    }

    if (pay.status !== 'paid') {
      return res.status(400).json({ message: 'Receipt can only be generated for paid payments' })
    }

    const receiptNumber = `SR-${new Date().getFullYear()}-${String(pay.id).padStart(5, '0')}`
    const location = [pay.sector, pay.district, pay.province].filter(Boolean).join(', ')
    const paymentDate = new Date(pay.payment_date).toLocaleDateString('en-RW', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
    const rentalStart = new Date(pay.rental_start).toLocaleDateString('en-RW', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

    generateReceiptPDF(res, {
      receipt_number: receiptNumber,
      payment_date: paymentDate,
      tenant_name: pay.tenant_name,
      tenant_phone: pay.tenant_phone,
      landlord_name: pay.landlord_name,
      landlord_phone: pay.landlord_phone,
      property_title: pay.property_title,
      property_location: location,
      amount: pay.amount,
      method: pay.method,
      month_year: pay.notes || `Payment #${pay.id}`,
      rental_start: rentalStart,
      notes: pay.notes
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const generateRequestReceipt = async (req, res) => {
  try {
    const [requests] = await pool.query(
      `SELECT pr.*,
              r.start_date as rental_start,
              tenant.full_name as tenant_name,
              tenant.phone as tenant_phone,
              landlord.full_name as landlord_name,
              landlord.phone as landlord_phone,
              p.title as property_title,
              p.district, p.province, p.sector,
              p.landlord_id
       FROM payment_requests pr
       JOIN rentals r ON pr.rental_id = r.id
       JOIN users tenant ON pr.tenant_id = tenant.id
       JOIN users landlord ON pr.landlord_id = landlord.id
       JOIN properties p ON r.property_id = p.id
       WHERE pr.id = ?`,
      [req.params.id]
    )

    if (!requests[0]) {
      return res.status(404).json({ message: 'Payment request not found' })
    }

    const pr = requests[0]

    if (pr.landlord_id !== req.user.id && pr.tenant_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    if (pr.status !== 'paid') {
      return res.status(400).json({ message: 'Receipt only available for paid requests' })
    }

    const receiptNumber = `SR-REQ-${new Date().getFullYear()}-${String(pr.id).padStart(5, '0')}`
    const location = [pr.sector, pr.district, pr.province].filter(Boolean).join(', ')
    const dueDate = new Date(pr.due_date).toLocaleDateString('en-RW', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
    const rentalStart = new Date(pr.rental_start).toLocaleDateString('en-RW', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

    generateReceiptPDF(res, {
      receipt_number: receiptNumber,
      payment_date: dueDate,
      tenant_name: pr.tenant_name,
      tenant_phone: pr.tenant_phone,
      landlord_name: pr.landlord_name,
      landlord_phone: pr.landlord_phone,
      property_title: pr.property_title,
      property_location: location,
      amount: pr.amount,
      method: 'Recorded',
      month_year: pr.month_year,
      rental_start: rentalStart,
      notes: pr.note
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}