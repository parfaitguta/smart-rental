import pool from '../config/db.js'

export const createPaymentRequest = async (data) => {
  const { rental_id, landlord_id, tenant_id, amount, due_date, month_year, note } = data
  const [result] = await pool.query(
    `INSERT INTO payment_requests 
     (rental_id, landlord_id, tenant_id, amount, due_date, month_year, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [rental_id, landlord_id, tenant_id, amount, due_date, month_year, note || null]
  )
  return result.insertId
}

export const getRequestsByLandlord = async (landlord_id) => {
  const [rows] = await pool.query(
    `SELECT pr.*,
            u.full_name as tenant_name, u.phone as tenant_phone,
            p.title as property_title
     FROM payment_requests pr
     JOIN users u ON pr.tenant_id = u.id
     JOIN rentals r ON pr.rental_id = r.id
     JOIN properties p ON r.property_id = p.id
     WHERE pr.landlord_id = ?
     ORDER BY pr.created_at DESC`,
    [landlord_id]
  )
  return rows
}

export const getRequestsByTenant = async (tenant_id) => {
  const [rows] = await pool.query(
    `SELECT pr.*,
            u.full_name as landlord_name, u.phone as landlord_phone,
            p.title as property_title
     FROM payment_requests pr
     JOIN users u ON pr.landlord_id = u.id
     JOIN rentals r ON pr.rental_id = r.id
     JOIN properties p ON r.property_id = p.id
     WHERE pr.tenant_id = ?
     ORDER BY pr.created_at DESC`,
    [tenant_id]
  )
  return rows
}

export const getRequestsByRental = async (rental_id) => {
  const [rows] = await pool.query(
    `SELECT * FROM payment_requests WHERE rental_id = ? ORDER BY due_date DESC`,
    [rental_id]
  )
  return rows
}

export const updateRequestStatus = async (id, status) => {
  await pool.query(
    'UPDATE payment_requests SET status = ? WHERE id = ?',
    [status, id]
  )
}

export const deleteRequest = async (id, landlord_id) => {
  const [result] = await pool.query(
    'DELETE FROM payment_requests WHERE id = ? AND landlord_id = ?',
    [id, landlord_id]
  )
  return result.affectedRows
}

export const getPaymentChartData = async (rental_id) => {
  const [rows] = await pool.query(
    `SELECT 
       month_year,
       amount,
       status,
       due_date
     FROM payment_requests 
     WHERE rental_id = ?
     ORDER BY due_date ASC`,
    [rental_id]
  )
  return rows
}

export const getRentalPaymentSummary = async (rental_id) => {
  const [rows] = await pool.query(
    `SELECT 
       COUNT(*) as total_requests,
       SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
       SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
       SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as total_overdue,
       COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
       COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
       COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
     FROM payment_requests
     WHERE rental_id = ?`,
    [rental_id]
  )
  return rows[0]
}