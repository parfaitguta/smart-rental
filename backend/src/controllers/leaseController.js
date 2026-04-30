import pool from '../config/db.js'
import { generateLeasePDF } from '../utils/generateLease.js'

export const generateLease = async (req, res) => {
  try {
    const { rentalId } = req.params

    const [rentals] = await pool.query(
      `SELECT r.*,
              p.title as property_title,
              p.district, p.province, p.sector, p.cell, p.village,
              p.landlord_id,
              tenant.full_name as tenant_name,
              tenant.phone as tenant_phone,
              tenant.email as tenant_email,
              landlord.full_name as landlord_name,
              landlord.phone as landlord_phone,
              landlord.email as landlord_email
       FROM rentals r
       JOIN properties p ON r.property_id = p.id
       JOIN users tenant ON r.tenant_id = tenant.id
       JOIN users landlord ON p.landlord_id = landlord.id
       WHERE r.id = ?`,
      [rentalId]
    )

    if (!rentals[0]) {
      return res.status(404).json({ message: 'Rental not found' })
    }

    const rental = rentals[0]

    // Only landlord or tenant can download
    if (rental.landlord_id !== req.user.id && rental.tenant_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this lease' })
    }

    const leaseNumber = `LEASE-${new Date().getFullYear()}-${String(rental.id).padStart(5, '0')}`
    const location = [rental.village, rental.cell, rental.sector, rental.district, rental.province]
      .filter(Boolean).join(', ')

    const startDate = new Date(rental.start_date).toLocaleDateString('en-RW', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
    const endDate = rental.end_date
      ? new Date(rental.end_date).toLocaleDateString('en-RW', {
          day: 'numeric', month: 'long', year: 'numeric'
        })
      : null

    generateLeasePDF(res, {
      lease_number: leaseNumber,
      tenant_name: rental.tenant_name,
      tenant_phone: rental.tenant_phone,
      tenant_email: rental.tenant_email,
      landlord_name: rental.landlord_name,
      landlord_phone: rental.landlord_phone,
      landlord_email: rental.landlord_email,
      property_title: rental.property_title,
      property_location: location,
      start_date: startDate,
      end_date: endDate,
      monthly_rent: rental.monthly_rent,
      payment_method: 'Cash / MTN MoMo / Airtel Money',
      payment_due_day: '5th'
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}