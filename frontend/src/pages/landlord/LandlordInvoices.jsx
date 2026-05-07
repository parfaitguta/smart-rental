import { useState, useEffect } from 'react'
import { getLandlordInvoices, createInvoice, getInvoice } from '../../api/invoiceApi'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
  Plus, CreditCard, CheckCircle, AlertCircle,
  Clock, MapPin, User, ChevronRight
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers'

const statusIcons = {
  paid: <CheckCircle size={14} className="text-green-500" />,
  partial: <AlertCircle size={14} className="text-yellow-500" />,
  unpaid: <Clock size={14} className="text-gray-400" />,
  overdue: <AlertCircle size={14} className="text-red-500" />
}

export default function LandlordInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    rental_id: '', amount: '', month_year: '', due_date: '', notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoiceDetail, setInvoiceDetail] = useState(null)
  const [filter, setFilter] = useState('all')

  const fetchInvoices = async () => {
    try {
      const res = await getLandlordInvoices()
      setInvoices(res.data.invoices || [])
    } catch (err) {
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInvoices() }, [])

  useEffect(() => {
    if (selectedInvoice) {
      getInvoice(selectedInvoice.id)
        .then(res => setInvoiceDetail(res.data))
        .catch(() => toast.error('Failed to load details'))
    }
  }, [selectedInvoice])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createInvoice(form)
      toast.success('Invoice created and tenant notified!')
      setShowForm(false)
      setForm({ rental_id: '', amount: '', month_year: '', due_date: '', notes: '' })
      fetchInvoices()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)

  // Summary stats
  const totalAmount = invoices.reduce((sum, i) => sum + parseFloat(i.amount), 0)
  const totalPaid = invoices.reduce((sum, i) => sum + parseFloat(i.amount_paid), 0)
  const totalRemaining = invoices.reduce((sum, i) => sum + parseFloat(i.remaining), 0)

  if (loading) return <Spinner size="lg" />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
          <p className="text-gray-500 text-sm mt-1">Manage tenant payment invoices</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Total Invoiced</p>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Total Collected</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Outstanding</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(totalRemaining)}</p>
        </div>
      </div>

      {/* Create Invoice Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-700 mb-4">Create New Invoice</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental ID *</label>
              <input type="number" value={form.rental_id}
                onChange={e => setForm({ ...form, rental_id: e.target.value })}
                placeholder="e.g. 1" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RWF) *</label>
              <input type="number" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 150000" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month/Year *</label>
              <input type="text" value={form.month_year}
                onChange={e => setForm({ ...form, month_year: e.target.value })}
                placeholder="e.g. May 2026" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input type="date" value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input type="text" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. May rent payment"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                {submitting ? 'Creating...' : 'Create & Notify Tenant'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'unpaid', 'partial', 'paid', 'overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}>
            {f} ({f === 'all' ? invoices.length : invoices.filter(i => i.status === f).length})
          </button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="flex gap-6">
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <CreditCard size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400">No {filter} invoices</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(inv => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow border-2 ${
                    selectedInvoice?.id === inv.id ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">{inv.month_year}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                          inv.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                          inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {statusIcons[inv.status]} {inv.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User size={11} /> {inv.tenant_name}
                        <MapPin size={11} /> {inv.property_title}
                      </div>
                      <div className="flex gap-4 text-xs mt-2">
                        <span className="text-gray-500">Total: <strong>{formatCurrency(inv.amount)}</strong></span>
                        <span className="text-green-600">Paid: <strong>{formatCurrency(inv.amount_paid)}</strong></span>
                        {inv.remaining > 0 && (
                          <span className="text-red-500">Remaining: <strong>{formatCurrency(inv.remaining)}</strong></span>
                        )}
                      </div>

                      {/* Mini progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (inv.amount_paid / inv.amount) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 ml-3 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Detail Panel */}
        {selectedInvoice && invoiceDetail && (
          <div className="w-80 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-3">Payment Details</h3>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Tenant:</strong> {invoiceDetail.invoice.tenant_name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Phone:</strong> {invoiceDetail.invoice.tenant_phone}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Due:</strong> {formatDate(invoiceDetail.invoice.due_date)}
              </p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Collected</span>
                  <span>{Math.round((invoiceDetail.invoice.amount_paid / invoiceDetail.invoice.amount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (invoiceDetail.invoice.amount_paid / invoiceDetail.invoice.amount) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-green-600">{formatCurrency(invoiceDetail.invoice.amount_paid)} paid</span>
                  <span className="text-red-500">{formatCurrency(invoiceDetail.invoice.remaining)} left</span>
                </div>
              </div>

              {/* Payment history */}
              {invoiceDetail.payments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Transaction History</p>
                  <div className="space-y-2">
                    {invoiceDetail.payments.map(pay => (
                      <div key={pay.id} className={`p-2 rounded-lg text-xs ${
                        pay.status === 'successful' ? 'bg-green-50 text-green-700' :
                        pay.status === 'failed' ? 'bg-red-50 text-red-600' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>
                        <div className="flex justify-between">
                          <span className="font-medium">{formatCurrency(pay.amount)}</span>
                          <span className="capitalize">{pay.status}</span>
                        </div>
                        <p className="text-gray-400 mt-0.5">{pay.phone} • {pay.method.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}