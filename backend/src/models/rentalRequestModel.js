import pool from '../config/db.js'

export const createRequest = async (property_id, renter_id, message) => {
  const [result] = await pool.query(
    'INSERT INTO rental_requests (property_id, renter_id, message) VALUES (?, ?, ?)',
    [property_id, renter_id, message]
  )
  return result.insertId
}

export const getRequestById = async (id) => {
  const [rows] = await pool.query(
    `SELECT rr.*, 
            p.title as property_title, p.price, p.district, p.province,
            u.full_name as renter_name, u.phone as renter_phone, u.email as renter_email
     FROM rental_requests rr
     JOIN properties p ON rr.property_id = p.id
     JOIN users u ON rr.renter_id = u.id
     WHERE rr.id = ?`,
    [id]
  )
  return rows[0]
}

export const getRequestsByLandlord = async (landlord_id) => {
  const [rows] = await pool.query(
    `SELECT rr.*, 
            p.title as property_title, p.price, p.district, p.province,
            u.full_name as renter_name, u.phone as renter_phone, u.email as renter_email
     FROM rental_requests rr
     JOIN properties p ON rr.property_id = p.id
     JOIN users u ON rr.renter_id = u.id
     WHERE p.landlord_id = ?
     ORDER BY rr.created_at DESC`,
    [landlord_id]
  )
  return rows
}

export const getRequestsByRenter = async (renter_id) => {
  const [rows] = await pool.query(
    `SELECT rr.*, 
            p.title as property_title, p.price, p.district, p.province,
            u.full_name as landlord_name, u.phone as landlord_phone
     FROM rental_requests rr
     JOIN properties p ON rr.property_id = p.id
     JOIN users u ON p.landlord_id = u.id
     WHERE rr.renter_id = ?
     ORDER BY rr.created_at DESC`,
    [renter_id]
  )
  return rows
}

export const updateRequestStatus = async (id, status) => {
  const [result] = await pool.query(
    'UPDATE rental_requests SET status = ? WHERE id = ?',
    [status, id]
  )
  return result.affectedRows
}

export const checkExistingRequest = async (property_id, renter_id) => {
  const [rows] = await pool.query(
    `SELECT id FROM rental_requests 
     WHERE property_id = ? AND renter_id = ? AND status = 'pending'`,
    [property_id, renter_id]
  )
  return rows[0]
}