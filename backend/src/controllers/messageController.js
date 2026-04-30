import pool from '../config/db.js'
import { NOTIF } from '../utils/notify.js'

export const send = async (req, res) => {
  try {
    const { receiver_id, property_id, message } = req.body

    if (!receiver_id || !message) {
      return res.status(400).json({ message: 'receiver_id and message are required' })
    }
    if (parseInt(receiver_id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot message yourself' })
    }

    const [receiver] = await pool.query('SELECT id FROM users WHERE id = ?', [receiver_id])
    if (!receiver[0]) {
      return res.status(404).json({ message: 'Receiver not found' })
    }

    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, property_id, message) VALUES (?, ?, ?, ?)',
      [req.user.id, receiver_id, property_id || null, message]
    )

    await NOTIF.newMessage(receiver_id, req.user.full_name)

    res.status(201).json({ message: 'Message sent', id: result.insertId })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getConversations = async (req, res) => {
  try {
    const user_id = req.user.id
    const [rows] = await pool.query(
      `SELECT m.*,
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
    res.json({ conversations: rows })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getChat = async (req, res) => {
  try {
    const user1_id = req.user.id
    const user2_id = req.params.userId
    const [rows] = await pool.query(
      `SELECT m.*,
              s.full_name as sender_name,
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
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [user2_id, user1_id]
    )
    res.json({ messages: rows })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const unreadCount = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE',
      [req.user.id]
    )
    res.json({ count: rows[0].count })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}