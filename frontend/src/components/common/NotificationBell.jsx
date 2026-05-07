import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  fetchNotifs, markAsRead, markAllAsRead,
  deleteNotification, clearAllNotifications
} from '../../api/notificationApi'
import { Bell, Check, Trash2, X } from 'lucide-react'

const typeColors = {
  request: 'bg-blue-100 text-blue-600',
  agreement: 'bg-green-100 text-green-600',
  payment: 'bg-yellow-100 text-yellow-600',
  message: 'bg-purple-100 text-purple-600',
  alert: 'bg-red-100 text-red-600',
  general: 'bg-gray-100 text-gray-600'
}

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const fetchNotifications = async () => {
    if (!user) return
    try {
      const res = await fetchNotifs()
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unread_count)
    } catch (err) {
      console.error('Notification fetch error:', err.message)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleRead = async (notif) => {
    if (!notif.is_read) {
      await markAsRead(notif.id)
      fetchNotifications()
    }
    if (notif.link) {
      setOpen(false)
      navigate(notif.link)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    fetchNotifications()
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await deleteNotification(id)
    fetchNotifications()
  }

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return
    await clearAllNotifications()
    fetchNotifications()
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Bell size={20} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
            <h3 className="font-bold text-gray-800">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex gap-2 items-center">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear all
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleRead(notif)}
                  className={`flex gap-3 px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notif.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm ${typeColors[notif.type]}`}>
                    {notif.type === 'request' ? '🏠' :
                     notif.type === 'agreement' ? '📋' :
                     notif.type === 'payment' ? '💰' :
                     notif.type === 'message' ? '💬' :
                     notif.type === 'alert' ? '⚠️' : '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-gray-800 ${
                      !notif.is_read ? 'font-semibold' : 'font-medium'
                    }`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    <button
                      onClick={(e) => handleDelete(e, notif.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}