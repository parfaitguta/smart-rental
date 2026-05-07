import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { getRentalPaymentRequests, createPaymentRequest, updatePaymentRequestStatus, deletePaymentRequest } from '../../api/paymentRequestApi'
import api from '../../api/axios'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Plus, CheckCircle,
  AlertCircle, Trash2, TrendingUp
} from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/helpers'

const statusColors = {
  paid: '#22c55e',
  pending: '#f59e0b',
  overdue: '#ef4444'
}

export default function TenantPaymentChart() {
  const { rentalId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [rental, setRental] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    due_date: '',
    month_year: '',
    note: ''
  })

  const fetchData = async () => {
    try {
      const [chartRes, rentalRes] = await Promise.all([
        getRentalPaymentRequests(rentalId),
        api.get(`/rentals/${rentalId}`)
      ])
      setData(chartRes.data)
      setRental(rentalRes.data.rental)
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [rentalId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createPaymentRequest({ ...form, rental_id: rentalId })
      toast.success('Payment request sent to tenant!')
      setShowForm(false)
      setForm({ amount: '', due_date: '', month_year: '', note: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await updatePaymentRequestStatus(id, status)
      toast.success(`Marked as ${status}`)
      fetchData()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment request?')) return
    try {
      await deletePaymentRequest(id)
      toast.success('Deleted')
      fetchData()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  if (loading) return <Spinner size="lg" />

  const chartData = data?.chartData?.map(d => ({
    name: d.month_year,
    amount: parseFloat(d.amount),
    status: d.status
  })) || []

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/landlord/tenants')}
          className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Tracker</h1>
          {rental && (
            <p className="text-gray-500 text-sm mt-0.5">
              {rental.tenant_name} — {rental.property_title}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> Request Payment
        </button>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Total Requests</p>
            <p className="text-xl font-bold text-gray-800">{data.summary.total_requests}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Total Paid</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(data.summary.total_paid)}</p>
            <p className="text-xs text-gray-400">{data.summary.paid_count} payment(s)</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Pending</p>
            <p className="text-xl font-bold text-yellow-600">{formatCurrency(data.summary.total_pending)}</p>
            <p className="text-xs text-gray-400">{data.summary.pending_count} payment(s)</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Overdue</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(data.summary.total_overdue)}</p>
            <p className="text-xs text-gray-400">{data.summary.overdue_count} payment(s)</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" /> Monthly Payment History
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="amount" name="Amount (RWF)" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={statusColors[entry.status] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Payment Request Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-700 mb-4">Request Rent Payment</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month/Year *
              </label>
              <input
                type="text"
                value={form.month_year}
                onChange={e => setForm({ ...form, month_year: e.target.value })}
                placeholder="e.g. May 2026"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (RWF) *
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder={rental ? `e.g. ${rental.monthly_rent}` : 'e.g. 150000'}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (optional)
              </label>
              <input
                type="text"
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                placeholder="e.g. Please pay before the 5th"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Requests List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-700">Payment Requests</h3>
        </div>
        {data?.requests?.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No payment requests yet. Click "Request Payment" to send one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Month', 'Amount', 'Due Date', 'Status', 'Note', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.requests?.map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{req.month_year}</td>
                  <td className="px-4 py-3 font-semibold text-blue-700">{formatCurrency(req.amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(req.due_date)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      req.status === 'paid' ? 'bg-green-100 text-green-700' :
                      req.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{req.note || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {req.status !== 'paid' && (
                        <button onClick={() => handleStatusUpdate(req.id, 'paid')}
                          className="text-green-500 hover:text-green-700 flex items-center gap-1 text-xs">
                          <CheckCircle size={13} /> Paid
                        </button>
                      )}
                      {req.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(req.id, 'overdue')}
                          className="text-red-400 hover:text-red-600 flex items-center gap-1 text-xs">
                          <AlertCircle size={13} /> Overdue
                        </button>
                      )}
                      <button onClick={() => handleDelete(req.id)}
                        className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-xs">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}