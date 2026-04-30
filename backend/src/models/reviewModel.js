import pool from '../config/db.js'

export const createReview = async (property_id, renter_id, rental_id, rating, comment) => {
  const [result] = await pool.query(
    `INSERT INTO reviews (property_id, renter_id, rental_id, rating, comment)
     VALUES (?, ?, ?, ?, ?)`,
    [property_id, renter_id, rental_id, rating, comment || null]
  )
  return result.insertId
}

export const getPropertyReviews = async (property_id) => {
  const [rows] = await pool.query(
    `SELECT r.*,
            u.full_name as renter_name
     FROM reviews r
     JOIN users u ON r.renter_id = u.id
     WHERE r.property_id = ?
     ORDER BY r.created_at DESC`,
    [property_id]
  )
  return rows
}

export const getPropertyRating = async (property_id) => {
  const [rows] = await pool.query(
    `SELECT 
       COUNT(*) as total_reviews,
       COALESCE(AVG(rating), 0) as average_rating,
       COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
       COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
       COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
       COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
       COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
     FROM reviews
     WHERE property_id = ?`,
    [property_id]
  )
  return rows[0]
}

export const getRenterReviews = async (renter_id) => {
  const [rows] = await pool.query(
    `SELECT r.*,
            p.title as property_title,
            p.district, p.province
     FROM reviews r
     JOIN properties p ON r.property_id = p.id
     WHERE r.renter_id = ?
     ORDER BY r.created_at DESC`,
    [renter_id]
  )
  return rows
}

export const checkExistingReview = async (rental_id, renter_id) => {
  const [rows] = await pool.query(
    'SELECT id FROM reviews WHERE rental_id = ? AND renter_id = ?',
    [rental_id, renter_id]
  )
  return rows[0]
}

export const deleteReview = async (id, renter_id) => {
  const [result] = await pool.query(
    'DELETE FROM reviews WHERE id = ? AND renter_id = ?',
    [id, renter_id]
  )
  return result.affectedRows
}

export const getLandlordReviews = async (landlord_id) => {
  const [rows] = await pool.query(
    `SELECT r.*,
            u.full_name as renter_name,
            p.title as property_title
     FROM reviews r
     JOIN users u ON r.renter_id = u.id
     JOIN properties p ON r.property_id = p.id
     WHERE p.landlord_id = ?
     ORDER BY r.created_at DESC`,
    [landlord_id]
  )
  return rows
}