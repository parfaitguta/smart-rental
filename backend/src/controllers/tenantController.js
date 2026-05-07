import {
  getTenantsForLandlord, getTenantDetails, getTenantPayments,
  getTenantNotes, addTenantNote, updateTenantStatus,
  terminateWithReason, deleteTenantNote
} from '../models/tenantModel.js'
import { getPropertyById, updateProperty } from '../models/propertyModel.js'
import pool from '../config/db.js'

// GET /api/tenants — landlord gets all their tenants
export const getMyTenants = async (req, res) => {
  try {
    const tenants = await getTenantsForLandlord(req.user.id)
    res.json({ count: tenants.length, tenants })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/tenants/landlord - Get all tenants for a landlord (for mobile app)
export const getLandlordTenants = async (req, res) => {
  try {
    const landlordId = req.user.id;
    
    const query = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        p.id as property_id,
        p.title as property_title,
        p.price as monthly_rent,
        r.id as rental_id,
        r.start_date,
        r.end_date
      FROM users u
      INNER JOIN rentals r ON u.id = r.tenant_id
      INNER JOIN properties p ON r.property_id = p.id
      WHERE p.landlord_id = ? AND r.status = 'active'
      ORDER BY u.full_name
    `;
    
    const [tenants] = await pool.query(query, [landlordId]);
    
    res.json({ success: true, count: tenants.length, tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/tenants/rental/:rentalId/monthly-breakdown - Get monthly payment breakdown
export const getMonthlyBreakdown = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Verify access
    let verifyQuery = '';
    if (userRole === 'landlord') {
      verifyQuery = `
        SELECT r.id FROM rentals r
        JOIN properties p ON r.property_id = p.id
        WHERE r.id = ? AND p.landlord_id = ?
      `;
    } else if (userRole === 'tenant') {
      verifyQuery = `SELECT id FROM rentals WHERE id = ? AND tenant_id = ?`;
    } else {
      verifyQuery = `SELECT id FROM rentals WHERE id = ?`;
    }
    
    const [verify] = await pool.query(verifyQuery, [rentalId, userId]);
    if (verify.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Get rental details
    const [rental] = await pool.query(`
      SELECT r.id, r.monthly_rent, p.title as property_title,
             u.full_name as tenant_name, u.email, u.phone
      FROM rentals r
      JOIN properties p ON r.property_id = p.id
      JOIN users u ON r.tenant_id = u.id
      WHERE r.id = ?
    `, [rentalId]);
    
    if (rental.length === 0) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    
    const monthlyRent = parseFloat(rental[0].monthly_rent);
    const currentYear = new Date().getFullYear();
    
    // Get payments
    const [payments] = await pool.query(`
      SELECT id, amount, payment_date, status, reference_number, payment_method
      FROM payments WHERE rental_id = ? ORDER BY payment_date DESC
    `, [rentalId]);
    
    // Create monthly breakdown
    const monthlyBreakdown = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    for (let month = 0; month < 12; month++) {
      const monthPayments = payments.filter(p => {
        const d = new Date(p.payment_date);
        return d.getMonth() === month && d.getFullYear() === currentYear;
      });
      
      const totalPaid = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const remaining = Math.max(0, monthlyRent - totalPaid);
      let status = 'unpaid';
      if (totalPaid >= monthlyRent) status = 'paid';
      else if (totalPaid > 0) status = 'partial';
      
      monthlyBreakdown.push({
        month_year: `${currentYear}-${String(month+1).padStart(2,'0')}`,
        month_name: `${monthNames[month]} ${currentYear}`,
        year: currentYear,
        month: month + 1,
        monthly_rent: monthlyRent,
        paid_amount: totalPaid,
        remaining_amount: remaining,
        status: status,
        payment_percentage: monthlyRent > 0 ? (totalPaid / monthlyRent) * 100 : 0,
        payments: monthPayments.map(p => ({
          id: p.id,
          amount: parseFloat(p.amount),
          date: p.payment_date,
          status: p.status,
          reference: p.reference_number,
          method: p.payment_method
        }))
      });
    }
    
    res.json({ success: true, rental: rental[0], monthly_breakdown: monthlyBreakdown });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tenants/:rentalId — get full tenant details
export const getTenantDetail = async (req, res) => {
  try {
    const tenant = await getTenantDetails(req.params.rentalId, req.user.id)
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found or not authorized' })
    }

    const [payments, notes] = await Promise.all([
      getTenantPayments(req.params.rentalId),
      getTenantNotes(req.params.rentalId)
    ])

    res.json({ tenant, payments, notes })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// POST /api/tenants/:rentalId/notes — add note about tenant
export const addNote = async (req, res) => {
  try {
    const { note, type } = req.body

    if (!note) {
      return res.status(400).json({ message: 'Note is required' })
    }

    const tenant = await getTenantDetails(req.params.rentalId, req.user.id)
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found or not authorized' })
    }

    const id = await addTenantNote(
      req.params.rentalId, req.user.id,
      tenant.tenant_id, note,
      type || 'general'
    )

    // If warning, update tenant status
    if (type === 'warning') {
      const notes = await getTenantNotes(req.params.rentalId)
      const warnings = notes.filter(n => n.type === 'warning').length
      if (warnings >= 3) {
        await updateTenantStatus(req.params.rentalId, 'problematic')
      } else if (warnings >= 1) {
        await updateTenantStatus(req.params.rentalId, 'warning')
      }
    }

    res.status(201).json({ message: 'Note added successfully', id })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/tenants/:rentalId/status — update tenant status
export const updateStatus = async (req, res) => {
  try {
    const { tenant_status } = req.body

    if (!['good', 'warning', 'problematic'].includes(tenant_status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const tenant = await getTenantDetails(req.params.rentalId, req.user.id)
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found or not authorized' })
    }

    await updateTenantStatus(req.params.rentalId, tenant_status)
    res.json({ message: `Tenant status updated to ${tenant_status}` })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/tenants/:rentalId/terminate — terminate with reason
export const terminateTenancy = async (req, res) => {
  try {
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ message: 'Termination reason is required' })
    }

    const tenant = await getTenantDetails(req.params.rentalId, req.user.id)
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found or not authorized' })
    }
    if (tenant.status !== 'active') {
      return res.status(400).json({ message: 'Rental is not active' })
    }

    await terminateWithReason(req.params.rentalId, reason)

    // Mark property as available
    const property = await getPropertyById(tenant.property_id)
    await updateProperty(tenant.property_id, req.user.id, { ...property, status: 'available' })

    res.json({ message: 'Tenancy terminated successfully. Property is now available.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/tenants/notes/:noteId — delete a note
export const deleteNote = async (req, res) => {
  try {
    const affected = await deleteTenantNote(req.params.noteId, req.user.id)
    if (!affected) {
      return res.status(404).json({ message: 'Note not found or not authorized' })
    }
    res.json({ message: 'Note deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}