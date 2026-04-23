import pool from '../config/db.js'

export const createPayment = async (data) => {
  const { rental_id, amount, payment_date, method, status, notes } = data
  const [result] = await pool.query(
    `INSERT INTO payments (rental_id, amount, payment_date, method, status, notes) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [rental_id, amount, payment_date, method, status || 'paid', notes]
  )
  return result.insertId
}

export const getPaymentById = async (id) => {
  const [rows] = await pool.query(
    `SELECT pay.*,
            u.full_name as tenant_name, u.phone as tenant_phone,
            p.title as property_title, p.landlord_id
     FROM payments pay
     JOIN rentals r ON pay.rental_id = r.id
     JOIN users u ON r.tenant_id = u.id
     JOIN properties p ON r.property_id = p.id
     WHERE pay.id = ?`,
    [id]
  )
  return rows[0]
}

export const getPaymentsByRental = async (rental_id) => {
  const [rows] = await pool.query(
    `SELECT * FROM payments WHERE rental_id = ? ORDER BY payment_date DESC`,
    [rental_id]
  )
  return rows
}

export const getPaymentsByLandlord = async (landlord_id) => {
  const [rows] = await pool.query(
    `SELECT pay.*,
            u.full_name as tenant_name, u.phone as tenant_phone,
            p.title as property_title
     FROM payments pay
     JOIN rentals r ON pay.rental_id = r.id
     JOIN users u ON r.tenant_id = u.id
     JOIN properties p ON r.property_id = p.id
     WHERE p.landlord_id = ?
     ORDER BY pay.payment_date DESC`,
    [landlord_id]
  )
  return rows
}

export const getPaymentsByTenant = async (tenant_id) => {
  const [rows] = await pool.query(
    `SELECT pay.*,
            p.title as property_title,
            p.province, p.district
     FROM payments pay
     JOIN rentals r ON pay.rental_id = r.id
     JOIN properties p ON r.property_id = p.id
     WHERE r.tenant_id = ?
     ORDER BY pay.payment_date DESC`,
    [tenant_id]
  )
  return rows
}

export const getLandlordSummary = async (landlord_id) => {
  const [rows] = await pool.query(
    `SELECT 
       COALESCE(SUM(CASE WHEN pay.status = 'paid' THEN pay.amount ELSE 0 END), 0) as total_received,
       COALESCE(SUM(CASE WHEN pay.status = 'pending' THEN pay.amount ELSE 0 END), 0) as total_pending,
       COALESCE(SUM(CASE WHEN pay.status = 'overdue' THEN pay.amount ELSE 0 END), 0) as total_overdue,
       COUNT(CASE WHEN pay.status = 'paid' THEN 1 END) as paid_count,
       COUNT(CASE WHEN pay.status = 'pending' THEN 1 END) as pending_count,
       COUNT(CASE WHEN pay.status = 'overdue' THEN 1 END) as overdue_count
     FROM payments pay
     JOIN rentals r ON pay.rental_id = r.id
     JOIN properties p ON r.property_id = p.id
     WHERE p.landlord_id = ?`,
    [landlord_id]
  )
  return rows[0]
}

export const getMonthlyReport = async (landlord_id, year) => {
  const [rows] = await pool.query(
    `SELECT 
       MONTH(pay.payment_date) as month,
       MONTHNAME(pay.payment_date) as month_name,
       COUNT(*) as total_payments,
       COALESCE(SUM(CASE WHEN pay.status = 'paid' THEN pay.amount ELSE 0 END), 0) as total_received
     FROM payments pay
     JOIN rentals r ON pay.rental_id = r.id
     JOIN properties p ON r.property_id = p.id
     WHERE p.landlord_id = ? AND YEAR(pay.payment_date) = ?
     GROUP BY MONTH(pay.payment_date), MONTHNAME(pay.payment_date)
     ORDER BY MONTH(pay.payment_date)`,
    [landlord_id, year]
  )
  return rows
}

export const updatePaymentStatus = async (id, status) => {
  const [result] = await pool.query(
    'UPDATE payments SET status = ? WHERE id = ?',
    [status, id]
  )
  return result.affectedRows
}