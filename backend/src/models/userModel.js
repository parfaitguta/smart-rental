import pool from '../config/db.js'

export const findUserByEmail = async (email) => {
  const key = String(email ?? '').trim().toLowerCase()
  if (!key) return undefined
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1',
    [key]
  )
  return rows[0]
}

export const createUser = async ({ full_name, email, phone, password_hash, role }) => {
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [full_name, email, phone, password_hash, role]
  )
  return result.insertId
}

export const findUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?',
    [id]
  )
  return rows[0]
}