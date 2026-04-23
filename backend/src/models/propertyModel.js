import pool from '../config/db.js'

export const createProperty = async (data) => {
  const { landlord_id, title, description, price, province, district, sector, cell, village, latitude, longitude } = data
  const [result] = await pool.query(
    `INSERT INTO properties 
     (landlord_id, title, description, price, province, district, sector, cell, village, latitude, longitude) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [landlord_id, title, description, price, province, district, sector, cell, village, latitude, longitude]
  )
  return result.insertId
}

export const getAllProperties = async (filters = {}) => {
  let query = `SELECT p.*, 
               u.full_name as landlord_name, u.phone as landlord_phone,
               (SELECT image_url FROM property_images 
                WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
               FROM properties p 
               JOIN users u ON p.landlord_id = u.id 
               WHERE p.status = 'available'`
  const params = []

  if (filters.province) { query += ' AND p.province = ?'; params.push(filters.province) }
  if (filters.district) { query += ' AND p.district = ?'; params.push(filters.district) }
  if (filters.min_price) { query += ' AND p.price >= ?'; params.push(filters.min_price) }
  if (filters.max_price) { query += ' AND p.price <= ?'; params.push(filters.max_price) }

  query += ' ORDER BY p.created_at DESC'
  const [rows] = await pool.query(query, params)
  return rows
}

export const getPropertyById = async (id) => {
  const [rows] = await pool.query(
    `SELECT p.*, 
            u.full_name as landlord_name, u.phone as landlord_phone,
            (SELECT image_url FROM property_images 
             WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
     FROM properties p 
     JOIN users u ON p.landlord_id = u.id 
     WHERE p.id = ?`,
    [id]
  )
  return rows[0]
}

export const getLandlordProperties = async (landlord_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM properties WHERE landlord_id = ? ORDER BY created_at DESC',
    [landlord_id]
  )
  return rows
}

export const updateProperty = async (id, landlord_id, data) => {
  const { title, description, price, province, district, sector, cell, village, latitude, longitude, status } = data
  const [result] = await pool.query(
    `UPDATE properties 
     SET title=?, description=?, price=?, province=?, district=?, sector=?, cell=?, village=?, latitude=?, longitude=?, status=?
     WHERE id=? AND landlord_id=?`,
    [title, description, price, province, district, sector, cell, village, latitude, longitude, status, id, landlord_id]
  )
  return result.affectedRows
}

export const deleteProperty = async (id, landlord_id) => {
  const [result] = await pool.query(
    'DELETE FROM properties WHERE id = ? AND landlord_id = ?',
    [id, landlord_id]
  )
  return result.affectedRows
}