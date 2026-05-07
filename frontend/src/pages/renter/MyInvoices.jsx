import { useState, useEffect } from 'react'
import { getTenantRentals } from '../../api/rentalApi'
import {
  getTenantInvoices, createInvoice,
  getInvoice, payInvoice, verifyPayment
} from '../../api/invoiceApi'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
  CreditCard, AlertCircle, CheckCircle, Clock,
  Phone, MapPin, RefreshCw, ChevronDown,
  ChevronUp, Plus, X, Trash2
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers'
import PaymentHistoryModal from '../../components/common/PaymentHistoryModal'

const statusIcons = {
  paid: <CheckCircle size={14} className="text-green-500" />,
  partial: <AlertCircle size={14} className="text-yellow-500" />,
  unpaid: <Clock size={14} className="text-gray-400" />,
  overdue: <AlertCircle size={14} className="text-red-500" />,
  cancelled: <X size={14} className="text-gray-500" />
}

export default function MyInvoices() {
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedRentalForHistory, setSelectedRentalForHistory] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoiceDetail, setInvoiceDetail] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showPayForm, setShowPayForm] = useState(false)
  const [form, setForm] = useState({
    rental_id: '', amount: '', month_year: '', due_date: '', notes: ''
  })
  const [payForm, setPayForm] = useState({ amount: '', phone: '', method: 'mtn_momo' })
  const [paying, setPaying] = useState(false)
  const [creating, setCreating] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [lastPaymentId, setLastPaymentId] = useState(null)

  const fetchData = async () => {
    try {
      const [invRes, rentRes] = await Promise.all([
        getTenantInvoices(),
        getTenantRentals()
      ])
      setInvoices(invRes.data.invoices || [])
      setRentals(rentRes.data.rentals || [])
    } catch (err) {
      setInvoices([])
      setRentals([])
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoiceDetail = async (id) => {
    try {
      const res = await getInvoice(id)
      setInvoiceDetail(res.data)
    } catch (err) {
      toast.error('Failed to load invoice details')
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (selectedInvoice) {
      fetchInvoiceDetail(selectedInvoice.id)
      setPayForm({
        amount: selectedInvoice.remaining,
        phone: '',
        method: 'mtn_momo'
      })
      setShowPayForm(false)
      setLastPaymentId(null)
    }
  }, [selectedInvoice])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await createInvoice(form)
      toast.success('Invoice created successfully!')
      setShowCreateForm(false)
      setForm({ rental_id: '', amount: '', month_year: '', due_date: '', notes: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice')
    } finally {
      setCreating(false)
    }
  }

  // NEW: Cancel Invoice Handler
  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return
    
    if (!window.confirm(`Are you sure you want to cancel this invoice for ${selectedInvoice.month_year}?\n\nThis action cannot be undone.`)) {
      return
    }

    setCancelling(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/invoices/${selectedInvoice.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Invoice cancelled successfully')
        fetchData()
        setSelectedInvoice(null)
        setInvoiceDetail(null)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to cancel invoice')
      }
    } catch (err) {
      console.error('Error cancelling invoice:', err)
      toast.error('Failed to cancel invoice')
    } finally {
      setCancelling(false)
    }
  }

  const handlePay = async (e) => {
    e.preventDefault()
    
    // REAL PAYMENT WARNING - Confirmation dialog
    if (!window.confirm(`⚠️ REAL PAYMENT WARNING ⚠️\n\nYou are about to pay ${formatCurrency(payForm.amount)} from your mobile money account.\n\n❗ This amount will be DEDUCTED from your real mobile money balance.\n\n✅ Click OK to proceed with the payment\n❌ Click Cancel to abort\n\nMake sure you have sufficient funds in your mobile money account.`)) {
      return
    }
    
    setPaying(true)
    try {
      const res = await payInvoice(selectedInvoice.id, payForm)
      setLastPaymentId(res.data.payment_id)
      toast.success('Payment initiated! Check your phone to confirm.', {
        duration: 5000,
        icon: '📱'
      })
      setShowPayForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  const handleVerify = async () => {
    if (!lastPaymentId) return
    setVerifying(true)
    try {
      const res = await verifyPayment(selectedInvoice.id, lastPaymentId)
      if (res.data.status === 'successful') {
        toast.success('Payment confirmed!')
        fetchData()
        fetchInvoiceDetail(selectedInvoice.id)
        setLastPaymentId(null)
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error('Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  // Helper to check if invoice can be cancelled
  const canCancelInvoice = (invoice) => {
    return invoice.status !== 'paid' && invoice.status !== 'cancelled'
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div className="flex gap-6">
      {/* Left Panel — Invoice List */}
      <div className="w-80 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Invoices</h1>
            <p className="text-gray-500 text-sm mt-0.5">{invoices.length} invoice(s)</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (rentals.length > 0) {
                  setSelectedRentalForHistory(rentals[0])
                  setShowHistoryModal(true)
                } else {
                  toast.error('No rental property found')
                }
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
            >
              <Clock size={14} /> History
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
            >
              <Plus size={14} /> New
            </button>
          </div>
        </div>

        {/* Create Invoice Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700 text-sm">Create Invoice</h3>
              <button onClick={() => setShowCreateForm(false)}>
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Rental *
                </label>
                <select
                  value={form.rental_id}
                  onChange={e => {
                    const rental = rentals.find(r => r.id === parseInt(e.target.value))
                    setForm({
                      ...form,
                      rental_id: e.target.value,
                      amount: rental?.monthly_rent || ''
                    })
                  }}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a rental...</option>
                  {rentals.filter(r => r.status === 'active').map(r => (
                    <option key={r.id} value={r.id}>
                      {r.property_title} — {formatCurrency(r.monthly_rent)}/mo
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Amount (RWF) *
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="e.g. 150000"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Month/Year *
                </label>
                <input
                  type="text"
                  value={form.month_year}
                  onChange={e => setForm({ ...form, month_year: e.target.value })}
                  placeholder="e.g. May 2026"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. May rent"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Create Invoice'}
              </button>
            </form>
          </div>
        )}

        {/* Invoice List */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <CreditCard size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No invoices yet</p>
            <p className="text-gray-300 text-xs mt-1">
              Click "+ New" to create your first invoice
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map(inv => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className={`bg-white rounded-xl p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow border-2 ${
                  selectedInvoice?.id === inv.id ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{inv.month_year}</p>
                    <p className="text-gray-400 text-xs">{inv.property_title}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                    inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                    inv.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                    inv.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                    inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {statusIcons[inv.status] || <Clock size={14} className="text-gray-400" />} {inv.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500">{formatCurrency(inv.amount)}</span>
                  {parseFloat(inv.remaining) > 0 && inv.status !== 'cancelled' && (
                    <span className="text-red-500 font-medium">
                      {formatCurrency(inv.remaining)} left
                    </span>
                  )}
                </div>
                {/* Mini progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full ${inv.status === 'cancelled' ? 'bg-gray-400' : 'bg-green-500'}`}
                    style={{
                      width: `${Math.min(100, (inv.amount_paid / inv.amount) * 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Due: {formatDate(inv.due_date)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel — Invoice Detail */}
      <div className="flex-1">
        {!selectedInvoice ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm h-64 flex flex-col items-center justify-center">
            <CreditCard size={48} className="text-gray-200 mb-3" />
            <p className="text-gray-400">Select an invoice to view details and pay</p>
          </div>
        ) : !invoiceDetail ? (
          <Spinner size="lg" />
        ) : (
          <div>
            {/* Invoice Header */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {invoiceDetail.invoice.month_year} Invoice
                  </h2>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <MapPin size={13} />
                    {invoiceDetail.invoice.property_title} — {invoiceDetail.invoice.district}, {invoiceDetail.invoice.province}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    Landlord: {invoiceDetail.invoice.landlord_name} ({invoiceDetail.invoice.landlord_phone})
                  </p>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  invoiceDetail.invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                  invoiceDetail.invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                  invoiceDetail.invoice.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                  invoiceDetail.invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {invoiceDetail.invoice.status.toUpperCase()}
                </span>
              </div>

              {/* Amount Cards */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-gray-800">
                    {formatCurrency(invoiceDetail.invoice.amount)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">Amount Paid</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(invoiceDetail.invoice.amount_paid)}
                  </p>
                </div>
                <div className={`rounded-xl p-4 text-center ${
                  parseFloat(invoiceDetail.invoice.remaining) > 0 && invoiceDetail.invoice.status !== 'cancelled' ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <p className="text-xs text-gray-400 mb-1">Remaining</p>
                  <p className={`text-lg font-bold ${
                    parseFloat(invoiceDetail.invoice.remaining) > 0 && invoiceDetail.invoice.status !== 'cancelled' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {invoiceDetail.invoice.status === 'cancelled' ? 'CANCELLED' : formatCurrency(invoiceDetail.invoice.remaining)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {invoiceDetail.invoice.status !== 'cancelled' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Payment Progress</span>
                    <span>
                      {Math.round((invoiceDetail.invoice.amount_paid / invoiceDetail.invoice.amount) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full transition-all flex items-center justify-center"
                      style={{
                        width: `${Math.min(100, (invoiceDetail.invoice.amount_paid / invoiceDetail.invoice.amount) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              <p className="text-gray-500 text-sm">
                Due Date: <strong>{formatDate(invoiceDetail.invoice.due_date)}</strong>
              </p>
              {invoiceDetail.invoice.notes && (
                <p className="text-gray-400 text-sm mt-1">
                  Note: {invoiceDetail.invoice.notes}
                </p>
              )}

              {/* Cancel Button - Show if not paid and not cancelled */}
              {canCancelInvoice(invoiceDetail.invoice) && (
                <div className="mt-4">
                  <button
                    onClick={handleCancelInvoice}
                    disabled={cancelling}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Trash2 size={18} />
                    {cancelling ? 'Cancelling...' : 'Cancel Invoice'}
                  </button>
                </div>
              )}

              {/* Pay Section - Only show if not paid and not cancelled */}
              {parseFloat(invoiceDetail.invoice.remaining) > 0 && invoiceDetail.invoice.status !== 'cancelled' && (
                <div className="mt-4">
                  {lastPaymentId && (
                    <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl p-3 flex justify-between items-center">
                      <p className="text-blue-700 text-sm">
                        Payment pending — confirm on your phone then verify here
                      </p>
                      <button
                        onClick={handleVerify}
                        disabled={verifying}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-60"
                      >
                        <RefreshCw size={13} className={verifying ? 'animate-spin' : ''} />
                        {verifying ? 'Checking...' : 'Verify'}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setShowPayForm(!showPayForm)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    Pay with MoMo / Airtel Money
                    {showPayForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showPayForm && (
                    <form onSubmit={handlePay}
                      className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200 space-y-3">
                      <h4 className="font-semibold text-gray-700">Enter Payment Details</h4>
                      
                      {/* Real Payment Warning */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                        <p className="text-red-700 text-xs font-medium flex items-center gap-1">
                          <AlertCircle size={12} /> REAL PAYMENT
                        </p>
                        <p className="text-red-600 text-xs mt-1">
                          Real money will be deducted from your mobile money account.
                          Make sure you have sufficient balance.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount (RWF) — Remaining: {formatCurrency(invoiceDetail.invoice.remaining)}
                        </label>
                        <input
                          type="number"
                          value={payForm.amount}
                          onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                          max={invoiceDetail.invoice.remaining}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          You can pay partially — minimum any amount up to {formatCurrency(invoiceDetail.invoice.remaining)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={payForm.phone}
                            onChange={e => setPayForm({ ...payForm, phone: e.target.value })}
                            placeholder="07XXXXXXXX"
                            required
                            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Enter your MTN or Airtel phone number
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPayForm({ ...payForm, method: 'mtn_momo' })}
                            className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                              payForm.method === 'mtn_momo'
                                ? 'bg-yellow-400 border-yellow-500 text-yellow-900'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            📱 MTN MoMo
                          </button>
                          <button
                            type="button"
                            onClick={() => setPayForm({ ...payForm, method: 'airtel_money' })}
                            className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                              payForm.method === 'airtel_money'
                                ? 'bg-red-500 border-red-600 text-white'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            📱 Airtel Money
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={paying}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
                      >
                        {paying ? 'Processing...' : `Pay ${formatCurrency(payForm.amount || 0)}`}
                      </button>

                      <p className="text-xs text-gray-400 text-center">
                        You will receive a prompt on your phone to confirm the payment
                      </p>
                    </form>
                  )}
                </div>
              )}

              {/* Paid / Cancelled Status Messages */}
              {invoiceDetail.invoice.status === 'paid' && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <CheckCircle size={28} className="text-green-500 mx-auto mb-1" />
                  <p className="text-green-700 font-semibold">Invoice fully paid! 🎉</p>
                </div>
              )}

              {invoiceDetail.invoice.status === 'cancelled' && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <X size={28} className="text-gray-500 mx-auto mb-1" />
                  <p className="text-gray-600 font-semibold">Invoice has been cancelled</p>
                </div>
              )}
            </div>

            {/* Payment History */}
            {invoiceDetail.payments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-3">Payment History</h3>
                <div className="space-y-2">
                  {invoiceDetail.payments.map(pay => (
                    <div key={pay.id}
                      className={`flex justify-between items-center p-3 rounded-lg border text-sm ${
                        pay.status === 'successful' ? 'bg-green-50 border-green-200' :
                        pay.status === 'failed' ? 'bg-red-50 border-red-200' :
                        'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-800">{formatCurrency(pay.amount)}</p>
                        <p className="text-xs text-gray-400">{pay.phone}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {pay.method.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          pay.status === 'successful' ? 'bg-green-100 text-green-700' :
                          pay.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {pay.status}
                        </span>
                        {pay.paid_at && (
                          <p className="text-xs text-gray-400 mt-1">{formatDate(pay.paid_at)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment History Modal */}
      {showHistoryModal && (
        <PaymentHistoryModal
          rental={selectedRentalForHistory}
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  )
}