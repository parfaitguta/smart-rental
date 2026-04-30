import {
  getUserNotifications, getUnreadCount, markAsRead,
  markAllAsRead, deleteNotification, clearAllNotifications
} from '../models/notificationModel.js'

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id)
    const unread = await getUnreadCount(req.user.id)
    res.json({ notifications, unread_count: parseInt(unread) })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/notifications/unread-count
export const getUnread = async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.id)
    res.json({ count: parseInt(count) })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/notifications/:id/read
export const readOne = async (req, res) => {
  try {
    await markAsRead(req.params.id, req.user.id)
    res.json({ message: 'Marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/notifications/read-all
export const readAll = async (req, res) => {
  try {
    await markAllAsRead(req.user.id)
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/notifications/:id
export const removeOne = async (req, res) => {
  try {
    await deleteNotification(req.params.id, req.user.id)
    res.json({ message: 'Notification deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/notifications/clear-all
export const clearAll = async (req, res) => {
  try {
    await clearAllNotifications(req.user.id)
    res.json({ message: 'All notifications cleared' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}