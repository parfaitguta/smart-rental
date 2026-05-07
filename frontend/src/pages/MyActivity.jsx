import { useState, useEffect } from 'react'
import { getMyActivity } from '../api/activityApi'
import Spinner from '../components/common/Spinner'
import {
  Activity, LogIn, Home, CreditCard,
  MessageSquare, Star, User, Shield
} from 'lucide-react'

const actionIcons = {
  LOGIN: <LogIn size={14} className="text-blue-500" />,
  LOGOUT: <LogIn size={14} className="text-gray-400" />,
  REGISTER: <User size={14} className="text-green-500" />,
  PROPERTY_ADDED: <Home size={14} className="text-blue-500" />,
  PROPERTY_UPDATED: <Home size={14} className="text-yellow-500" />,
  PROPERTY_DELETED: <Home size={14} className="text-red-500" />,
  REQUEST_SENT: <Activity size={14} className="text-purple-500" />,
  REQUEST_ACCEPTED: <Activity size={14} className="text-green-500" />,
  REQUEST_REJECTED: <Activity size={14} className="text-red-500" />,
  RENTAL_CREATED: <Home size={14} className="text-green-500" />,
  RENTAL_TERMINATED: <Home size={14} className="text-red-500" />,
  PAYMENT_RECORDED: <CreditCard size={14} className="text-green-500" />,
  PAYMENT_REQUESTED: <CreditCard size={14} className="text-yellow-500" />,
  MESSAGE_SENT: <MessageSquare size={14} className="text-blue-500" />,
  REVIEW_SUBMITTED: <Star size={14} className="text-yellow-500" />,
  PASSWORD_CHANGED: <Shield size={14} className="text-orange-500" />,
  PROFILE_UPDATED: <User size={14} className="text-blue-500" />,
}

const actionColors = {
  LOGIN: 'bg-blue-50 border-blue-200',
  LOGOUT: 'bg-gray-50 border-gray-200',
  REGISTER: 'bg-green-50 border-green-200',
  PROPERTY_ADDED: 'bg-blue-50 border-blue-200',
  PROPERTY_UPDATED: 'bg-yellow-50 border-yellow-200',
  PROPERTY_DELETED: 'bg-red-50 border-red-200',
  REQUEST_SENT: 'bg-purple-50 border-purple-200',
  REQUEST_ACCEPTED: 'bg-green-50 border-green-200',
  REQUEST_REJECTED: 'bg-red-50 border-red-200',
  RENTAL_CREATED: 'bg-green-50 border-green-200',
  RENTAL_TERMINATED: 'bg-red-50 border-red-200',
  PAYMENT_RECORDED: 'bg-green-50 border-green-200',
  PAYMENT_REQUESTED: 'bg-yellow-50 border-yellow-200',
  MESSAGE_SENT: 'bg-blue-50 border-blue-200',
  REVIEW_SUBMITTED: 'bg-yellow-50 border-yellow-200',
  PASSWORD_CHANGED: 'bg-orange-50 border-orange-200',
  PROFILE_UPDATED: 'bg-blue-50 border-blue-200',
}

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function MyActivity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState(50)

  const fetchActivity = async () => {
    setLoading(true)
    try {
      const res = await getMyActivity(limit)
      setActivities(res.data.activities || [])
    } catch (err) {
      console.error('Failed to load activity:', err.message)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchActivity() }, [limit])

  if (loading) return <Spinner size="lg" />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Activity</h1>
          <p className="text-gray-500 text-sm mt-1">Your recent actions on the platform</p>
        </div>
        <select
          value={limit}
          onChange={e => setLimit(parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={25}>Last 25</option>
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
        </select>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Activity size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No activity recorded yet</p>
          <p className="text-gray-300 text-sm mt-1">
            Actions like login, adding properties, and payments will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map(act => (
            <div key={act.id}
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                actionColors[act.action] || 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {actionIcons[act.action] || <Activity size={14} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{act.description}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(act.created_at)}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(act.created_at).toLocaleDateString('en-RW')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}