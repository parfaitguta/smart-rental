// frontend/src/pages/admin/AdminWithdrawals.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Clock, Eye, RefreshCw, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/helpers'

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    setLoading(true)
    try {
      const response = await api.get('/wallet/admin/withdrawals')
      setWithdrawals(response.data.withdrawals || [])
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
      toast.error('Failed to load withdrawal requests')
    } finally {
      setLoading(false)
    }
  }

  const processWithdrawal = async (id, status) => {
    setProcessing(id)
    try {
      const response = await api.put(`/wallet/admin/withdrawals/${id}`, { status })
      if (response.data.success) {
        toast.success(`Withdrawal ${status === 'completed' ? 'approved and money sent!' : 'cancelled'}`)
        fetchWithdrawals()
      } else {
        toast.error(response.data.error || 'Failed to process withdrawal')
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      toast.error(error.response?.data?.error || 'Failed to process withdrawal')
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"><CheckCircle size={12} /> Completed</span>
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"><Clock size={12} /> Pending</span>
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Processing</span>
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"><AlertCircle size={12} /> Failed</span>
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"><XCircle size={12} /> Cancelled</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{status}</span>
    }
  }

  const filteredWithdrawals = withdrawals.filter(w => {
    if (filter === 'all') return true
    return w.status === filter
  })

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0)
  }

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardBgClass = darkMode ? 'bg-gray-800' : 'bg-white'
  const textColorClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-500'
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200'

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${bgClass}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgClass} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${textColorClass}`}>Withdrawal Requests</h1>
          <p className={`${textSecondaryClass} text-sm mt-1`}>Review and process landlord withdrawal requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`${cardBgClass} rounded-xl shadow-sm p-4 border ${borderClass}`}>
            <p className={`text-sm ${textSecondaryClass}`}>Total Requests</p>
            <p className={`text-2xl font-bold ${textColorClass}`}>{stats.total}</p>
          </div>
          <div className={`${cardBgClass} rounded-xl shadow-sm p-4 border ${borderClass}`}>
            <p className={`text-sm text-yellow-600`}>Pending</p>
            <p className={`text-2xl font-bold text-yellow-600`}>{stats.pending}</p>
          </div>
          <div className={`${cardBgClass} rounded-xl shadow-sm p-4 border ${borderClass}`}>
            <p className={`text-sm text-green-600`}>Completed</p>
            <p className={`text-2xl font-bold text-green-600`}>{stats.completed}</p>
          </div>
          <div className={`${cardBgClass} rounded-xl shadow-sm p-4 border ${borderClass}`}>
            <p className={`text-sm ${textSecondaryClass}`}>Total Amount</p>
            <p className={`text-2xl font-bold text-blue-600`}>{formatCurrency(stats.totalAmount)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['all', 'pending', 'completed', 'failed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === tab
                  ? 'bg-blue-600 text-white'
                  : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({withdrawals.filter(w => w.status === tab).length})
            </button>
          ))}
        </div>

        {/* Withdrawals Table */}
        <div className={`${cardBgClass} rounded-xl shadow-sm border ${borderClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${borderClass}`}>
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium uppercase text-gray-500">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium uppercase text-gray-500">Landlord</th>
                  <th className="text-left px-6 py-3 text-xs font-medium uppercase text-gray-500">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium uppercase text-gray-500">Phone</th>
                  <th className="text-left px-6 py-3 text-xs font-medium uppercase text-gray-500">Method</th>
                  <th className="text-left px-6 py-3 text-xs font-medium uppercase text-gray-500">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y ${borderClass}">
                {filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">No withdrawal requests found</td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((wd) => (
                    <tr key={wd.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 text-sm text-gray-500">#{wd.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800 dark:text-white">{wd.full_name}</p>
                        <p className="text-xs text-gray-500">{wd.email}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-blue-600">{formatCurrency(wd.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{wd.phone}</td>
                      <td className="px-6 py-4 text-sm capitalize text-gray-600">{wd.method?.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(wd.created_at)}</td>
                      <td className="px-6 py-4">{getStatusBadge(wd.status)}</td>
                      <td className="px-6 py-4">
                        {wd.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => processWithdrawal(wd.id, 'completed')}
                              disabled={processing === wd.id}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              {processing === wd.id ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                              Approve
                            </button>
                            <button
                              onClick={() => processWithdrawal(wd.id, 'cancelled')}
                              disabled={processing === wd.id}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
                        )}
                        {wd.status === 'completed' && wd.reference && (
                          <p className="text-xs text-gray-500">Ref: {wd.reference}</p>
                        )}
                        {wd.status === 'failed' && wd.notes && (
                          <p className="text-xs text-red-500 mt-1">{wd.notes}</p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={fetchWithdrawals}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}