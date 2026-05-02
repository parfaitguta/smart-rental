import {
  createRental, getRentalById, getRentalsByLandlord,
  getRentalsByTenant, updateRentalStatus, checkActiveRental
} from '../models/rentalModel.js'
import { getPropertyById, updateProperty } from '../models/propertyModel.js'
import { NOTIF } from '../utils/notify.js'
import pool from '../config/db.js'

export const createRentalAgreement = async (req, res) => {
  try {
    const { property_id, tenant_id, start_date, end_date, monthly_rent } = req.body

    if (!property_id || !tenant_id || !start_date || !monthly_rent) {
      return res.status(400).json({ message: 'property_id, tenant_id, start_date and monthly_rent are required' })
    }

    const property = await getPropertyById(property_id)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    if (property.landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized — this is not your property' })
    }

    const activeRental = await checkActiveRental(property_id)
    if (activeRental) {
      return res.status(400).json({ message: 'Property already has an active rental agreement' })
    }

    const id = await createRental({ property_id, tenant_id, start_date, end_date, monthly_rent })
    await updateProperty(property_id, req.user.id, { ...property, status: 'rented' })
    await NOTIF.agreementCreated(tenant_id, property.title)

    const rental = await getRentalById(id)
    res.status(201).json({ message: 'Rental agreement created successfully', rental })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getLandlordRentals = async (req, res) => {
  try {
    const rentals = await getRentalsByLandlord(req.user.id)
    res.json({ count: rentals.length, rentals })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getTenantRentals = async (req, res) => {
  try {
    const rentals = await getRentalsByTenant(req.user.id)
    res.json({ count: rentals.length, rentals })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getRentalDetail = async (req, res) => {
  try {
    const rental = await getRentalById(req.params.id)
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' })
    }
    if (rental.landlord_id !== req.user.id && rental.tenant_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this rental' })
    }
    res.json({ rental })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const terminateRental = async (req, res) => {
  try {
    const rental = await getRentalById(req.params.id)
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' })
    }
    if (rental.landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to terminate this rental' })
    }
    if (rental.status !== 'active') {
      return res.status(400).json({ message: `Rental is already ${rental.status}` })
    }

    await updateRentalStatus(req.params.id, 'terminated')

    const property = await getPropertyById(rental.property_id)
    await updateProperty(rental.property_id, req.user.id, { ...property, status: 'available' })

    res.json({ message: 'Rental terminated successfully. Property is now available.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/rentals/:id/monthly-breakdown - Get monthly payment breakdown for all months of the year (January to December)
export const getMonthlyBreakdown = async (req, res) => {
  try {
    const { id } = req.params

    // Verify user has access
    const [rentals] = await pool.query(
      `SELECT r.*, p.title as property_title, p.landlord_id,
       CONCAT(u.full_name, ' (', u.phone, ')') as tenant_info
       FROM rentals r
       JOIN properties p ON r.property_id = p.id
       JOIN users u ON r.tenant_id = u.id
       WHERE r.id = ? AND (r.tenant_id = ? OR p.landlord_id = ?)`,
      [id, req.user.id, req.user.id]
    )

    if (!rentals[0]) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const rental = rentals[0]
    const monthlyRent = parseFloat(rental.monthly_rent)
    const currentYear = new Date().getFullYear()

    // Generate all 12 months of the current year
    const monthsList = []
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    for (let month = 1; month <= 12; month++) {
      const monthName = monthNames[month - 1]
      const monthYear = `${currentYear}-${String(month).padStart(2, '0')}`
      
      monthsList.push({
        year: currentYear,
        month: month,
        month_year: monthYear,
        month_name: `${monthName} ${currentYear}`,
        start_of_month: new Date(currentYear, month - 1, 1).toISOString().slice(0, 10),
        end_of_month: new Date(currentYear, month, 0).toISOString().slice(0, 10)
      })
    }

    // Get all payments for this rental
    const [payments] = await pool.query(
      `SELECT amount, payment_date, status, notes 
       FROM payments 
       WHERE rental_id = ? AND status = 'paid'
       ORDER BY payment_date`,
      [id]
    )

    // Calculate payment per month
    const monthlyBreakdown = monthsList.map(month => {
      let paidAmount = 0
      let paymentDetails = []
      
      payments.forEach(payment => {
        const paymentDate = new Date(payment.payment_date)
        if (paymentDate.getFullYear() === month.year && paymentDate.getMonth() + 1 === month.month) {
          paidAmount += parseFloat(payment.amount)
          paymentDetails.push({
            amount: payment.amount,
            date: payment.payment_date,
            status: payment.status
          })
        }
      })
      
      const remaining = monthlyRent - paidAmount
      
      return {
        ...month,
        monthly_rent: monthlyRent,
        paid_amount: paidAmount,
        remaining_amount: remaining > 0 ? remaining : 0,
        status: remaining <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
        payment_percentage: (paidAmount / monthlyRent) * 100,
        payments: paymentDetails
      }
    })

    // Calculate totals
    const totalRent = monthlyBreakdown.length * monthlyRent
    const totalPaid = monthlyBreakdown.reduce((sum, m) => sum + m.paid_amount, 0)
    const totalRemaining = monthlyBreakdown.reduce((sum, m) => sum + m.remaining_amount, 0)
    const totalPaidMonths = monthlyBreakdown.filter(m => m.status === 'paid').length
    const totalPartialMonths = monthlyBreakdown.filter(m => m.status === 'partial').length
    const totalUnpaidMonths = monthlyBreakdown.filter(m => m.status === 'unpaid').length

    res.json({
      rental: {
        id: rental.id,
        property_title: rental.property_title,
        monthly_rent: monthlyRent,
        tenant_info: rental.tenant_info,
        start_date: rental.start_date,
        end_date: rental.end_date,
        status: rental.status
      },
      summary: {
        total_months: monthlyBreakdown.length,
        paid_months: totalPaidMonths,
        partial_months: totalPartialMonths,
        unpaid_months: totalUnpaidMonths,
        total_rent_expected: totalRent,
        total_paid: totalPaid,
        total_remaining: totalRemaining
      },
      monthly_breakdown: monthlyBreakdown
    })
  } catch (error) {
    console.error('Error in getMonthlyBreakdown:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}