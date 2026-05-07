import { useState, useEffect } from 'react'
import { getLandlordPayments, getPaymentSummary, getMonthlyReport, recordPayment, updatePaymentStatus } from '../../api/paymentApi'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { Plus, TrendingUp, AlertCircle, CheckCircle, Clock, Download, X } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers'

const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : 'http://localhost:5000/api'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [form, setForm] = useState({
    rental_id: '', amount: '', payment_date: '', method: 'cash', status: 'paid', notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    try {
      const [p, s, r] = await Promise.all([
        getLandlordPayments(),
        getPaymentSummary(),
        getMonthlyReport(new Date().getFullYear())
      ])
      setPayments(p.data.payments || [])
      setSummary(s.data.summary)
      setReport(r.data.monthly_breakdown || [])
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleRecord = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await recordPayment(form)
      toast.success('Payment recorded!')
      setShowForm(false)
      setForm({ rental_id: '', amount: '', payment_date: '', method: 'cash', status: 'paid', notes: '' })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await updatePaymentStatus(id, status)
      toast.success(`Payment marked as ${status}`)
      fetchAll()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/receipts/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        toast.error('Receipt not available for this payment')
        return
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${paymentId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Receipt downloaded!')
    } catch (err) {
      toast.error('Failed to download receipt')
    }
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">Track and record rent payments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Clock size={16} /> Full History
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="bg-green-100 p-2.5 rounded-xl">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Received</p>
              <p className="font-bold text-gray-800">{formatCurrency(summary.total_received || 0)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="bg-yellow-100 p-2.5 rounded-xl">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="font-bold text-gray-800">{formatCurrency(summary.total_pending || 0)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="bg-red-100 p-2.5 rounded-xl">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Overdue</p>
              <p className="font-bold text-gray-800">{formatCurrency(summary.total_overdue || 0)}</p>
            </div>
          </div>
        </div>
      )}

      {report.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">
            {new Date().getFullYear()} Monthly Income
          </h2>
          <div className="flex flex-wrap gap-2">
            {report.map(m => (
              <div key={m.month} className="bg-blue-50 rounded-lg px-3 py-2 text-center min-w-[80px]">
                <p className="text-xs text-gray-500">{m.month_name?.slice(0, 3)}</p>
                <p className="text-sm font-bold text-blue-700">{formatCurrency(m.total_received || 0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border-l-4 border-blue-500">
          <h2 className="font-semibold text-gray-700 mb-4">Record New Payment</h2>
          <form onSubmit={handleRecord} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental ID *</label>
              <input type="number" name="rental_id" value={form.rental_id}
                onChange={e => setForm({ ...form, rental_id: e.target.value })}
                placeholder="e.g. 1" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RWF) *</label>
              <input type="number" name="amount" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 150000" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <input type="date" name="payment_date" value={form.payment_date}
                onChange={e => setForm({ ...form, payment_date: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
              <select name="method" value={form.method}
                onChange={e => setForm({ ...form, method: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="cash">Cash</option>
                <option value="mtn_momo">MTN MoMo</option>
                <option value="airtel_money">Airtel Money</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" name="notes" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. May 2026 rent"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                {submitting ? 'Recording...' : 'Record Payment'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Tenant', 'Property', 'Amount', 'Date', 'Method', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">No payments recorded yet</td>
              </tr>
            ) : payments.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.tenant_name}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{p.property_title}</td>
                <td className="px-4 py-3 font-semibold text-blue-700">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(p.payment_date)}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{p.method?.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {p.status !== 'paid' && (
                      <button onClick={() => handleStatusUpdate(p.id, 'paid')}
                        className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs">
                        <CheckCircle size={13} /> Mark Paid
                      </button>
                    )}
                    {p.status === 'paid' && (
                      <button onClick={() => handleDownloadReceipt(p.id)}
                        className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-xs">
                        <Download size={13} /> Receipt
                      </button>
                    )}
                  </div>
                </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">All Payment Transactions</h2>
                <p className="text-sm text-gray-500">{payments.length} total payments</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-green-600 text-xs">Total Received</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary?.total_received || 0)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-blue-600 text-xs">Total Transactions</p>
                  <p className="text-2xl font-bold">{payments.length}</p>
                </div>
              </div>

              {(() => {
                const propertyMap = {}
                payments.forEach(p => {
                  if (!propertyMap[p.property_title]) {
                    propertyMap[p.property_title] = { total: 0, count: 0 }
                  }
                  propertyMap[p.property_title].total += parseFloat(p.amount)
                  propertyMap[p.property_title].count++
                })
                return Object.keys(propertyMap).length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3">Payments by Property</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(propertyMap).map(([property, data]) => (
                        <div key={property} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                          <span className="font-medium">{property}</span>
                          <div className="text-right">
                            <span className="text-green-600 font-semibold">{formatCurrency(data.total)}</span>
                            <p className="text-xs text-gray-500">{data.count} payment(s)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <h3 className="font-semibold text-gray-700 mb-3">Transaction History</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Tenant</th>
                        <th className="px-4 py-2 text-left">Property</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                        <th className="px-4 py-2 text-left">Method</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{formatDate(payment.payment_date)}</td>
                          <td className="px-4 py-2 font-medium">{payment.tenant_name}</td>
                          <td className="px-4 py-2">{payment.property_title}</td>
                          <td className="px-4 py-2 text-right font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                          <td className="px-4 py-2 capitalize">{payment.method?.replace('_', ' ')}</td>
                          <td className="px-4 py-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No payment transactions found.</p>
                  <p className="text-sm mt-2">Record a payment first using the "Record Payment" button above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}