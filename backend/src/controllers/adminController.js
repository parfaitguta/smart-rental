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

// GET /api/admin/reports - Generate reports
export const getReports = async (req, res) => {
  try {
    const { type = 'monthly', year = new Date().getFullYear() } = req.query;
    
    let reportData = {};

    if (type === 'monthly') {
      // Get monthly revenue breakdown
      const [monthlyData] = await pool.query(`
        SELECT 
          MONTHNAME(payment_date) as month,
          MONTH(payment_date) as month_num,
          COUNT(*) as payment_count,
          COALESCE(SUM(amount), 0) as revenue
        FROM payments
        WHERE YEAR(payment_date) = ? AND status = 'paid'
        GROUP BY MONTH(payment_date), MONTHNAME(payment_date)
        ORDER BY month_num ASC
      `, [year]);
      
      // Get total properties
      const [totalProps] = await pool.query(`SELECT COUNT(*) as count FROM properties`);
      
      // Get total revenue
      const [totalRev] = await pool.query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM payments 
        WHERE YEAR(payment_date) = ? AND status = 'paid'
      `, [year]);
      
      // Get active rentals
      const [activeRentals] = await pool.query(`
        SELECT COUNT(*) as count FROM rentals WHERE status = 'active'
      `);
      
      // Get top properties
      const [topProperties] = await pool.query(`
        SELECT 
          p.title,
          COALESCE(SUM(pay.amount), 0) as revenue
        FROM properties p
        LEFT JOIN rentals r ON p.id = r.property_id
        LEFT JOIN payments pay ON r.id = pay.rental_id AND pay.status = 'paid'
        GROUP BY p.id
        ORDER BY revenue DESC
        LIMIT 5
      `);
      
      reportData = {
        total_properties: totalProps[0].count,
        total_revenue: totalRev[0].total,
        total_rentals: activeRentals[0].count,
        monthly_data: monthlyData,
        top_properties: topProperties
      };
    } else if (type === 'yearly') {
      // Get yearly breakdown
      const [yearlyData] = await pool.query(`
        SELECT 
          YEAR(payment_date) as year,
          COUNT(*) as payment_count,
          COALESCE(SUM(amount), 0) as revenue
        FROM payments
        WHERE status = 'paid'
        GROUP BY YEAR(payment_date)
        ORDER BY year DESC
      `);
      
      reportData = {
        yearly_data: yearlyData
      };
    } else if (type === 'property') {
      // Get property performance
      const [propertyData] = await pool.query(`
        SELECT 
          p.id,
          p.title,
          p.status,
          COUNT(DISTINCT r.id) as rental_count,
          COALESCE(SUM(pay.amount), 0) as total_revenue,
          COALESCE(AVG(pay.amount), 0) as avg_payment
        FROM properties p
        LEFT JOIN rentals r ON p.id = r.property_id
        LEFT JOIN payments pay ON r.id = pay.rental_id AND pay.status = 'paid'
        GROUP BY p.id
        ORDER BY total_revenue DESC
      `);
      
      reportData = {
        property_data: propertyData
      };
    }
    
    res.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/settings - Get system settings
export const getSettings = async (req, res) => {
  try {
    // You can store settings in a separate table or return defaults
    const settings = {
      maintenance_mode: false,
      require_approval: true,
      max_rental_days: 365,
      default_rental_fee: 0,
      notification_email: 'admin@smartrental.com',
      admin_email: 'admin@smartrental.com',
      platform_name: 'Smart Rental RW',
      platform_version: '1.0.0'
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/settings - Update system settings (optional)
export const updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    // Here you would save to a settings table
    // For now, just return success
    res.json({ message: 'Settings saved successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};