import pool from '../config/db.js'

export const logActivity = async (user_id, action, description, entity_type, entity_id, ip_address) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, action, description, entity_type || null, entity_id || null, ip_address || null]
    )
  } catch (err) {
    console.error('Activity log failed:', err.message)
  }
}

export const getUserActivities = async (user_id, limit = 50) => {
  const [rows] = await pool.query(
    `SELECT * FROM activity_logs 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [user_id, limit]
  )
  return rows
}

export const getAllActivities = async (limit = 100) => {
  const [rows] = await pool.query(
    `SELECT al.*,
            u.full_name as user_name,
            u.role as user_role,
            u.email as user_email
     FROM activity_logs al
     JOIN users u ON al.user_id = u.id
     ORDER BY al.created_at DESC
     LIMIT ?`,
    [limit]
  )
  return rows
}

export const getActivitiesByType = async (entity_type, limit = 50) => {
  const [rows] = await pool.query(
    `SELECT al.*,
            u.full_name as user_name,
            u.role as user_role
     FROM activity_logs al
     JOIN users u ON al.user_id = u.id
     WHERE al.entity_type = ?
     ORDER BY al.created_at DESC
     LIMIT ?`,
    [entity_type, limit]
  )
  return rows
}

export const getActivityStats = async () => {
  const [rows] = await pool.query(
    `SELECT 
       action,
       COUNT(*) as count,
       DATE(created_at) as date
     FROM activity_logs
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY action, DATE(created_at)
     ORDER BY date DESC, count DESC`
  )
  return rows
}

export const clearOldLogs = async (days = 90) => {
  await pool.query(
    'DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
    [days]
  )
}