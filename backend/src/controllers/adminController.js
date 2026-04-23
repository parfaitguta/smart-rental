import pool from '../config/db.js'

// GET /api/admin/stats — platform overview
export const getPlatformStats = async (req, res) => {
  try {
    const [[users]]       = await pool.query('SELECT COUNT(*) as total FROM users')
    const [[renters]]     = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'renter'")
    const [[landlords]]   = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'landlord'")
    const [[properties]]  = await pool.query('SELECT COUNT(*) as total FROM properties')
    const [[available]]   = await pool.query("SELECT COUNT(*) as total FROM properties WHERE status = 'available'")
    const [[rented]]      = await pool.query("SELECT COUNT(*) as total FROM properties WHERE status = 'rented'")
    const [[rentals]]     = await pool.query("SELECT COUNT(*) as total FROM rentals WHERE status = 'active'")
    const [[requests]]    = await pool.query("SELECT COUNT(*) as total FROM rental_requests WHERE status = 'pending'")
    const [[revenue]]     = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'paid'")
    const [[overdue]]     = await pool.query("SELECT COUNT(*) as total FROM payments WHERE status = 'overdue'")

    res.json({
      users: {
        total: users.total,
        renters: renters.total,
        landlords: landlords.total
      },
      properties: {
        total: properties.total,
        available: available.total,
        rented: rented.total
      },
      rentals: {
        active: rentals.total,
        pending_requests: requests.total
      },
      payments: {
        total_revenue: revenue.total,
        overdue_count: overdue.total
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/admin/users — list all users
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    )
    res.json({ count: users.length, users })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/admin/users/:id — get single user
export const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    )
    if (!rows[0]) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ user: rows[0] })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/admin/users/:id/role — change user role
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body
    if (!['renter', 'landlord', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Use: renter, landlord, or admin' })
    }

    const [result] = await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, req.params.id]
    )
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: `User role updated to ${role}` })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/admin/users/:id — delete a user
export const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' })
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id])
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/admin/properties — list all properties
export const getAllProperties = async (req, res) => {
  try {
    const [properties] = await pool.query(
      `SELECT p.*, u.full_name as landlord_name, u.phone as landlord_phone
       FROM properties p
       JOIN users u ON p.landlord_id = u.id
       ORDER BY p.created_at DESC`
    )
    res.json({ count: properties.length, properties })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/admin/properties/:id — delete any property
export const deleteProperty = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM properties WHERE id = ?', [req.params.id])
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Property not found' })
    }
    res.json({ message: 'Property deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/admin/rentals — list all rentals
export const getAllRentals = async (req, res) => {
  try {
    const [rentals] = await pool.query(
      `SELECT r.*,
              p.title as property_title, p.province, p.district,
              t.full_name as tenant_name, t.phone as tenant_phone,
              l.full_name as landlord_name
       FROM rentals r
       JOIN properties p ON r.property_id = p.id
       JOIN users t ON r.tenant_id = t.id
       JOIN users l ON p.landlord_id = l.id
       ORDER BY r.created_at DESC`
    )
    res.json({ count: rentals.length, rentals })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/admin/payments — list all payments
export const getAllPayments = async (req, res) => {
  try {
    const [payments] = await pool.query(
      `SELECT pay.*,
              u.full_name as tenant_name,
              p.title as property_title
       FROM payments pay
       JOIN rentals r ON pay.rental_id = r.id
       JOIN users u ON r.tenant_id = u.id
       JOIN properties p ON r.property_id = p.id
       ORDER BY pay.created_at DESC`
    )
    res.json({ count: payments.length, payments })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/admin/requests — list all rental requests
export const getAllRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(
      `SELECT rr.*,
              p.title as property_title, p.province, p.district,
              u.full_name as renter_name, u.phone as renter_phone,
              l.full_name as landlord_name
       FROM rental_requests rr
       JOIN properties p ON rr.property_id = p.id
       JOIN users u ON rr.renter_id = u.id
       JOIN users l ON p.landlord_id = l.id
       ORDER BY rr.created_at DESC`
    )
    res.json({ count: requests.length, requests })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}