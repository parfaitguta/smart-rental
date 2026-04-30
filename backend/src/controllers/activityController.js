import {
  getUserActivities, getAllActivities,
  getActivitiesByType, getActivityStats, clearOldLogs
} from '../models/activityModel.js'

export const myActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const activities = await getUserActivities(req.user.id, limit)
    res.json({ count: activities.length, activities })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const allActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100
    const activities = await getAllActivities(limit)
    res.json({ count: activities.length, activities })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const activityByType = async (req, res) => {
  try {
    const activities = await getActivitiesByType(req.params.type)
    res.json({ count: activities.length, activities })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const activityStats = async (req, res) => {
  try {
    const stats = await getActivityStats()
    res.json({ stats })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const clearLogs = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90
    await clearOldLogs(days)
    res.json({ message: `Cleared logs older than ${days} days` })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}