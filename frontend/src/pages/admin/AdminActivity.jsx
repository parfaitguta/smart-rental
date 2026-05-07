import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { Activity, Filter, Download } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function AdminActivity() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ action: '', user_id: '' })
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchUsers()
    fetchLogs()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.users || [])
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.action) params.append('action', filter.action)
      if (filter.user_id) params.append('user_id', filter.user_id)
      const res = await api.get(`/activities/all?${params.toString()}`)
      setLogs(res.data.logs || [])
    } catch (err) {
      console.error('Failed to load activity logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action) => {
    const colors = {
      LOGIN: 'bg-green-100 text-green-700',
      LOGOUT: 'bg-gray-100 text-gray-700',
      INVOICE_CREATED: 'bg-blue-100 text-blue-700',
      PAYMENT_INITIATED: 'bg-yellow-100 text-yellow-700',
      PAYMENT_COMPLETED: 'bg-green-100 text-green-700',
      PAYMENT_RECORDED: 'bg-purple-100 text-purple-700',
      RENTAL_CREATED: 'bg-indigo-100 text-indigo-700',
      RENTAL_TERMINATED: 'bg-red-100 text-red-700',
      PROPERTY_ADDED: 'bg-blue-100 text-blue-700'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[action] || 'bg-gray-100'}`}>
        {action}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor all user activities on the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Action Type</label>
            <select
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="INVOICE_CREATED">Invoice Created</option>
              <option value="PAYMENT_INITIATED">Payment Initiated</option>
              <option value="PAYMENT_COMPLETED">Payment Completed</option>
              <option value="PAYMENT_RECORDED">Payment Recorded</option>
              <option value="RENTAL_CREATED">Rental Created</option>
              <option value="RENTAL_TERMINATED">Rental Terminated</option>
              <option value="PROPERTY_ADDED">Property Added</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">User</label>
            <select
              value={filter.user_id}
              onChange={(e) => setFilter({ ...filter, user_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.full_name} ({user.role})</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchLogs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Filter size={14} /> Apply Filter
          </button>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Date & Time</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">User</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Action</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Description</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">No activity logs found</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(log.created_at, true)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{log.user_name}</p>
                        <p className="text-xs text-gray-400">{log.user_role}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3 text-gray-600">{log.description}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{log.ip_address || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}