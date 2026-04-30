import pool from '../config/db.js'

export const createNotification = async (user_id, title, message, type, link) => {
  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, title, message, type, link)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, title, message, type || 'general', link || null]
  )
  return result.insertId
}

export const getUserNotifications = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [user_id]
  )
  return rows
}

export const getUnreadCount = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM notifications 
     WHERE user_id = ? AND is_read = FALSE`,
    [user_id]
  )
  return rows[0].count
}

export const markAsRead = async (id, user_id) => {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [id, user_id]
  )
}

export const markAllAsRead = async (user_id) => {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
    [user_id]
  )
}

export const deleteNotification = async (id, user_id) => {
  await pool.query(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [id, user_id]
  )
}

export const clearAllNotifications = async (user_id) => {
  await pool.query(
    'DELETE FROM notifications WHERE user_id = ?',
    [user_id]
  )
}