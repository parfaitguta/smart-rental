import pool from '../config/db.js'

export const getTenantsForLandlord = async (landlord_id) => {
  const [rows] = await pool.query(
    `SELECT r.*,
            u.full_name as tenant_name,
            u.email as tenant_email,
            u.phone as tenant_phone,
            p.title as property_title,
            p.province, p.district, p.sector,
            (SELECT COUNT(*) FROM payments pay 
             WHERE pay.rental_id = r.id AND pay.status = 'paid') as paid_count,
            (SELECT COUNT(*) FROM payments pay 
             WHERE pay.rental_id = r.id AND pay.status = 'overdue') as overdue_count,
            (SELECT COUNT(*) FROM tenant_notes tn 
             WHERE tn.rental_id = r.id AND tn.type = 'warning') as warning_count
     FROM rentals r
     JOIN users u ON r.tenant_id = u.id
     JOIN properties p ON r.property_id = p.id
     WHERE p.landlord_id = ?
     ORDER BY r.created_at DESC`,
    [landlord_id]
  )
  return rows
}

export const getTenantDetails = async (rental_id, landlord_id) => {
  const [rows] = await pool.query(
    `SELECT r.*,
            u.full_name as tenant_name,
            u.email as tenant_email,
            u.phone as tenant_phone,
            p.title as property_title,
            p.province, p.district, p.sector,
            p.landlord_id
     FROM rentals r
     JOIN users u ON r.tenant_id = u.id
     JOIN properties p ON r.property_id = p.id
     WHERE r.id = ? AND p.landlord_id = ?`,
    [rental_id, landlord_id]
  )
  return rows[0]
}

export const getTenantPayments = async (rental_id) => {
  const [rows] = await pool.query(
    `SELECT * FROM payments WHERE rental_id = ? ORDER BY payment_date DESC`,
    [rental_id]
  )
  return rows
}

export const getTenantNotes = async (rental_id) => {
  const [rows] = await pool.query(
    `SELECT tn.*, 
            u.full_name as author_name
     FROM tenant_notes tn
     JOIN users u ON tn.landlord_id = u.id
     WHERE tn.rental_id = ?
     ORDER BY tn.created_at DESC`,
    [rental_id]
  )
  return rows
}

export const addTenantNote = async (rental_id, landlord_id, tenant_id, note, type) => {
  const [result] = await pool.query(
    `INSERT INTO tenant_notes (rental_id, landlord_id, tenant_id, note, type) 
     VALUES (?, ?, ?, ?, ?)`,
    [rental_id, landlord_id, tenant_id, note, type]
  )
  return result.insertId
}

export const updateTenantStatus = async (rental_id, tenant_status) => {
  await pool.query(
    'UPDATE rentals SET tenant_status = ? WHERE id = ?',
    [tenant_status, rental_id]
  )
}

export const terminateWithReason = async (rental_id, reason) => {
  await pool.query(
    `UPDATE rentals 
     SET status = 'terminated', termination_reason = ?, terminated_at = NOW()
     WHERE id = ?`,
    [reason, rental_id]
  )
}

export const deleteTenantNote = async (note_id, landlord_id) => {
  const [result] = await pool.query(
    'DELETE FROM tenant_notes WHERE id = ? AND landlord_id = ?',
    [note_id, landlord_id]
  )
  return result.affectedRows
}