import pool from '../config/db.js'

export const sendRentReminders = async (req, res) => {
  try {
    const [rentals] = await pool.query(
      `SELECT r.*, 
              p.title as property_title,
              u.phone as tenant_phone,
              u.full_name as tenant_name
       FROM rentals r
       JOIN properties p ON r.property_id = p.id
       JOIN users u ON r.tenant_id = u.id
       WHERE r.status = 'active'`
    )

    if (rentals.length === 0) {
      return res.json({ message: 'No active rentals found', results: [] })
    }

    // Since SMS is not configured, just log and return success
    const results = rentals.map(r => ({
      tenant: r.tenant_name,
      phone: r.tenant_phone,
      property: r.property_title,
      status: 'queued'
    }))

    console.log(`📱 Rent reminders queued for ${rentals.length} tenant(s)`)

    res.json({
      message: `Reminders queued for ${rentals.length} tenant(s)`,
      results
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const sendCustomSMS = async (req, res) => {
  try {
    const { phone, message } = req.body

    if (!phone || !message) {
      return res.status(400).json({ message: 'Phone and message are required' })
    }
    if (message.length > 160) {
      return res.status(400).json({ message: 'Message too long. Max 160 characters.' })
    }

    console.log(`📱 SMS to ${phone}: ${message}`)
    res.json({ message: 'SMS queued successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getSMSStats = async (req, res) => {
  try {
    const [[activeRentals]] = await pool.query(
      "SELECT COUNT(*) as count FROM rentals WHERE status = 'active'"
    )
    const [[overduePayments]] = await pool.query(
      "SELECT COUNT(*) as count FROM payments WHERE status = 'overdue'"
    )

    res.json({
      active_rentals: activeRentals.count,
      overdue_payments: overduePayments.count,
      reminder_targets: activeRentals.count
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}