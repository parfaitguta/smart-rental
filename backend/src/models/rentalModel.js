import pool from '../config/db.js'

export const createRental = async (data) => {
  const { property_id, tenant_id, start_date, end_date, monthly_rent } = data
  const [result] = await pool.query(
    `INSERT INTO rentals (property_id, tenant_id, start_date, end_date, monthly_rent) 
     VALUES (?, ?, ?, ?, ?)`,
    [property_id, tenant_id, start_date, end_date, monthly_rent]
  )
  return result.insertId
}

export const getRentalById = async (id) => {
  const [rows] = await pool.query(
    `SELECT r.*, 
            p.title as property_title, p.province, p.district, p.sector,
            p.landlord_id,
            u.full_name as tenant_name, u.phone as tenant_phone, u.email as tenant_email
     FROM rentals r
     JOIN properties p ON r.property_id = p.id
     JOIN users u ON r.tenant_id = u.id
     WHERE r.id = ?`,
    [id]
  )
  return rows[0]
}

export const getRentalsByLandlord = async (landlord_id) => {
  const [rows] = await pool.query(
    `SELECT r.*, 
            p.title as property_title, p.province, p.district,
            u.full_name as tenant_name, u.phone as tenant_phone, u.email as tenant_email
     FROM rentals r
     JOIN properties p ON r.property_id = p.id
     JOIN users u ON r.tenant_id = u.id
     WHERE p.landlord_id = ?
     ORDER BY r.created_at DESC`,
    [landlord_id]
  )
  return rows
}

export const getRentalsByTenant = async (tenant_id) => {
  const [rows] = await pool.query(
    `SELECT r.*, 
            p.title as property_title, p.province, p.district,
            u.full_name as landlord_name, u.phone as landlord_phone
     FROM rentals r
     JOIN properties p ON r.property_id = p.id
     JOIN users u ON p.landlord_id = u.id
     WHERE r.tenant_id = ?
     ORDER BY r.created_at DESC`,
    [tenant_id]
  )
  return rows
}

export const updateRentalStatus = async (id, status) => {
  const [result] = await pool.query(
    'UPDATE rentals SET status = ? WHERE id = ?',
    [status, id]
  )
  return result.affectedRows
}

export const checkActiveRental = async (property_id) => {
  const [rows] = await pool.query(
    `SELECT id FROM rentals WHERE property_id = ? AND status = 'active'`,
    [property_id]
  )
  return rows[0]
}