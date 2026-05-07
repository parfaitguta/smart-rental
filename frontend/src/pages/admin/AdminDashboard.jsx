import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { 
  Users, Home, Key, DollarSign, CheckCircle, Activity
} from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'
import {
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecentActivities()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const res = await api.get('/activities/all?limit=10')
      setRecentActivities(res.data.logs || [])
    } catch (err) {
      console.error('Failed to load activities:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statsCards = [
    { title: 'Total Users', value: stats?.users?.total || 0, icon: <Users size={24} />, color: 'bg-blue-500' },
    { title: 'Renters', value: stats?.users?.renters || 0, icon: <Users size={24} />, color: 'bg-green-500' },
    { title: 'Landlords', value: stats?.users?.landlords || 0, icon: <Users size={24} />, color: 'bg-purple-500' },
    { title: 'Total Properties', value: stats?.properties?.total || 0, icon: <Home size={24} />, color: 'bg-orange-500' },
    { title: 'Available', value: stats?.properties?.available || 0, icon: <CheckCircle size={24} />, color: 'bg-green-500' },
    { title: 'Rented', value: stats?.properties?.rented || 0, icon: <Key size={24} />, color: 'bg-blue-500' },
    { title: 'Active Rentals', value: stats?.rentals?.active || 0, icon: <Home size={24} />, color: 'bg-indigo-500' },
    { title: 'Total Revenue', value: formatCurrency(stats?.payments?.total_revenue || 0), icon: <DollarSign size={24} />, color: 'bg-yellow-500' },
  ]

  const pieData = [
    { name: 'Available', value: stats?.properties?.available || 0, color: '#10B981' },
    { name: 'Rented', value: stats?.properties?.rented || 0, color: '#3B82F6' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {statsCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-3 text-center hover:shadow-md transition-shadow">
            <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mx-auto mb-2`}>
              {card.icon}
            </div>
            <p className="text-xs text-gray-500">{card.title}</p>
            <p className="text-lg font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Property Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Property Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg text-center transition-colors"
            >
              <Users size={20} className="mx-auto mb-1" />
              <span className="text-xs">Manage Users</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/properties'}
              className="bg-green-50 hover:bg-green-100 text-green-700 p-3 rounded-lg text-center transition-colors"
            >
              <Home size={20} className="mx-auto mb-1" />
              <span className="text-xs">Manage Properties</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/rentals'}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-lg text-center transition-colors"
            >
              <Key size={20} className="mx-auto mb-1" />
              <span className="text-xs">View Rentals</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/payments'}
              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-3 rounded-lg text-center transition-colors"
            >
              <DollarSign size={20} className="mx-auto mb-1" />
              <span className="text-xs">Payments</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-700">Recent Platform Activities</h3>
        </div>
        <div className="divide-y">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No recent activities</div>
          ) : (
            recentActivities.map(activity => (
              <div key={activity.id} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity size={14} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.description}</p>
                  <p className="text-xs text-gray-400">
                    {activity.user_name} • {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {activity.action}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}