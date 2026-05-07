import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { Home, Calendar, FileText, X, User, Phone, Mail, Plus } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/helpers'

export default function ManageRentals() {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    property_id: '', tenant_id: '', start_date: '', end_date: '', monthly_rent: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchRentals = async () => {
    try {
      const res = await api.get('/rentals/landlord')
      setRentals(res.data.rentals)
    } catch (err) {
      toast.error('Failed to load rentals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRentals() }, [])

  const handleTerminate = async (id) => {
    if (!window.confirm('Are you sure you want to terminate this rental agreement?')) return
    try {
      await api.put(`/rentals/${id}/terminate`)
      toast.success('Rental agreement terminated. Property is now available.')
      fetchRentals()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to terminate')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/rentals', form)
      toast.success('Rental agreement created!')
      setShowForm(false)
      setForm({ property_id: '', tenant_id: '', start_date: '', end_date: '', monthly_rent: '' })
      fetchRentals()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create rental')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadLease = async (rentalId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/lease/${rentalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        toast.error('Lease agreement not available')
        return
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lease-agreement-${rentalId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Lease agreement downloaded!')
    } catch (err) {
      toast.error('Failed to download lease')
    }
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rental Agreements</h1>
          <p className="text-gray-500 text-sm mt-1">
            {rentals.filter(r => r.status === 'active').length} active agreements
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> New Rental Agreement
        </button>
      </div>

      {/* Create Rental Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border-l-4 border-blue-500">
          <h2 className="font-semibold text-gray-700 mb-4">Create New Rental Agreement</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property ID *</label>
              <input
                type="number"
                name="property_id"
                value={form.property_id}
                onChange={e => setForm({ ...form, property_id: e.target.value })}
                placeholder="e.g. 1"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Enter the property ID from your properties list</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenant ID *</label>
              <input
                type="number"
                name="tenant_id"
                value={form.tenant_id}
                onChange={e => setForm({ ...form, tenant_id: e.target.value })}
                placeholder="e.g. 2"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Enter the user ID of the tenant</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty for ongoing agreement</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (RWF) *</label>
              <input
                type="number"
                name="monthly_rent"
                value={form.monthly_rent}
                onChange={e => setForm({ ...form, monthly_rent: e.target.value })}
                placeholder="e.g. 150000"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                {submitting ? 'Creating...' : 'Create Agreement'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rentals List */}
      {rentals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Home size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No rental agreements yet</p>
          <p className="text-gray-300 text-sm mt-1">Click "New Rental Agreement" to create one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rentals.map(rental => (
            <div key={rental.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{rental.property_title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Home size={14} />
                      <span>Property ID: {rental.property_id}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rental.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {rental.status?.toUpperCase()}
                  </span>
                </div>

                {/* Tenant Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <User size={14} /> Tenant Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={14} className="text-blue-500" />
                      <span className="text-gray-600">{rental.tenant_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-purple-500" />
                      <span className="text-gray-600">{rental.tenant_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-green-500" />
                      <span className="text-gray-600">{rental.tenant_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Agreement Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Start Date</p>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Calendar size={14} className="text-blue-500" />
                      {formatDate(rental.start_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">End Date</p>
                    <p className="text-sm font-medium text-gray-700">
                      {rental.end_date ? formatDate(rental.end_date) : 'Ongoing'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Monthly Rent</p>
                    <p className="text-sm font-bold text-blue-700">{formatCurrency(rental.monthly_rent)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleDownloadLease(rental.id)}
                    className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <FileText size={14} /> Download Lease Agreement
                  </button>
                  {rental.status === 'active' && (
                    <button
                      onClick={() => handleTerminate(rental.id)}
                      className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X size={14} /> Terminate Agreement
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}