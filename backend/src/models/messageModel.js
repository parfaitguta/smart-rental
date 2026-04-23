import pool from '../config/db.js'

export const sendMessage = async (sender_id, receiver_id, property_id, message) => {
  const [result] = await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, property_id, message) 
     VALUES (?, ?, ?, ?)`,
    [sender_id, receiver_id, property_id || null, message]
  )
  return result.insertId
}

export const getConversation = async (user1_id, user2_id) => {
  const [rows] = await pool.query(
    `SELECT m.*,
            s.full_name as sender_name, s.role as sender_role,
            r.full_name as receiver_name,
            p.title as property_title
     FROM messages m
     JOIN users s ON m.sender_id = s.id
     JOIN users r ON m.receiver_id = r.id
     LEFT JOIN properties p ON m.property_id = p.id
     WHERE (m.sender_id = ? AND m.receiver_id = ?)
        OR (m.sender_id = ? AND m.receiver_id = ?)
     ORDER BY m.created_at ASC`,
    [user1_id, user2_id, user2_id, user1_id]
  )
  return rows
}

export const getMyConversations = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT 
       m.*,
       s.full_name as sender_name, s.role as sender_role,
       r.full_name as receiver_name, r.role as receiver_role,
       p.title as property_title
     FROM messages m
     JOIN users s ON m.sender_id = s.id
     JOIN users r ON m.receiver_id = r.id
     LEFT JOIN properties p ON m.property_id = p.id
     WHERE (m.sender_id = ? OR m.receiver_id = ?)
       AND m.id IN (
         SELECT MAX(m2.id) FROM messages m2
         WHERE m2.sender_id = ? OR m2.receiver_id = ?
         GROUP BY LEAST(m2.sender_id, m2.receiver_id), GREATEST(m2.sender_id, m2.receiver_id)
       )
     ORDER BY m.created_at DESC`,
    [user_id, user_id, user_id, user_id]
  )
  return rows
}

export const markAsRead = async (sender_id, receiver_id) => {
  await pool.query(
    `UPDATE messages SET is_read = TRUE 
     WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE`,
    [sender_id, receiver_id]
  )
}

export const getUnreadCount = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM messages 
     WHERE receiver_id = ? AND is_read = FALSE`,
    [user_id]
  )
  return rows[0].count
}