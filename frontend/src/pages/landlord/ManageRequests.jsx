import { useState, useEffect } from 'react'
import { getLandlordRequests, acceptRequest, rejectRequest } from '../../api/requestApi'
import { createRental } from '../../api/rentalApi'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { Check, X, MapPin, Phone, Mail, User, FileText } from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers'

export default function ManageRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAgreementForm, setShowAgreementForm] = useState(null)
  const [agreementForm, setAgreementForm] = useState({
    start_date: '', end_date: '', monthly_rent: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [accepting, setAccepting] = useState(null)

  const fetchRequests = async () => {
    try {
      const res = await getLandlordRequests()
      setRequests(res.data.requests)
    } catch (err) {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleAccept = async (req) => {
    setAccepting(req.id)
    try {
      await acceptRequest(req.id)
      toast.success('Request accepted! Now create the rental agreement.')
      // Update the request status locally without refetching
      setRequests(prev => prev.map(r =>
        r.id === req.id ? { ...r, status: 'accepted' } : r
      ))
      // Show agreement form
      setShowAgreementForm(req)
      setAgreementForm({
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        monthly_rent: req.price || ''
      })
      // Switch to accepted filter so user sees it
      setFilter('accepted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept')
    } finally {
      setAccepting(null)
    }
  }

  const handleCreateAgreement = async (e) => {
    e.preventDefault()
    if (!showAgreementForm) return
    setSubmitting(true)
    try {
      await createRental({
        property_id: showAgreementForm.property_id,
        tenant_id: showAgreementForm.renter_id,
        start_date: agreementForm.start_date,
        end_date: agreementForm.end_date || null,
        monthly_rent: agreementForm.monthly_rent
      })
      toast.success('🎉 Rental agreement created! Tenant is now active.')
      setShowAgreementForm(null)
      fetchRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create agreement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Reject this request?')) return
    try {
      await rejectRequest(id)
      toast.success('Request rejected')
      setRequests(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'rejected' } : r
      ))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject')
    }
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  if (loading) return <Spinner size="lg" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Rental Requests</h1>
        <p className="text-gray-500 text-sm mt-1">{requests.length} total requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'accepted', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            {f} ({f === 'all' ? requests.length : requests.filter(r => r.status === f).length})
          </button>
        ))}
      </div>

      {/* Agreement Creation Form */}
      {showAgreementForm && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText size={18} className="text-green-600" />
                Create Rental Agreement
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                For <strong>{showAgreementForm.renter_name}</strong> →{' '}
                <strong>{showAgreementForm.property_title}</strong>
              </p>
              <p className="text-blue-600 text-sm font-medium mt-0.5">
                {formatCurrency(showAgreementForm.price)}/month
              </p>
            </div>
            <button onClick={() => setShowAgreementForm(null)}
              className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateAgreement}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={agreementForm.start_date}
                onChange={e => setAgreementForm({ ...agreementForm, start_date: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (optional)
              </label>
              <input
                type="date"
                value={agreementForm.end_date}
                onChange={e => setAgreementForm({ ...agreementForm, end_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent (RWF) *
              </label>
              <input
                type="number"
                value={agreementForm.monthly_rent}
                onChange={e => setAgreementForm({ ...agreementForm, monthly_rent: e.target.value })}
                placeholder="e.g. 150000"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button type="submit" disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-60">
                <Check size={16} />
                {submitting ? 'Creating...' : 'Create Agreement & Activate Tenant'}
              </button>
              <button type="button" onClick={() => setShowAgreementForm(null)}
                className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg text-sm">
                Skip for now
              </button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-400">No {filter} requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => (
            <div key={req.id} className={`bg-white rounded-xl shadow-sm p-5 ${
              showAgreementForm?.id === req.id ? 'ring-2 ring-green-400' : ''
            }`}>
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{req.property_title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                    <MapPin size={12} /> {req.district}, {req.province}
                    <span className="ml-2 font-semibold text-blue-700">
                      {formatCurrency(req.price)}/mo
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={14} className="text-blue-500" /> {req.renter_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-green-500" /> {req.renter_phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="text-purple-500" /> {req.renter_email}
                    </div>
                  </div>

                  {req.message && (
                    <p className="text-gray-500 text-sm italic">"{req.message}"</p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    Received: {formatDate(req.created_at)}
                  </p>

                  {/* Show create agreement button if accepted */}
                  {req.status === 'accepted' && !showAgreementForm && (
                    <button
                      onClick={() => {
                        setShowAgreementForm(req)
                        setAgreementForm({
                          start_date: new Date().toISOString().split('T')[0],
                          end_date: '',
                          monthly_rent: req.price || ''
                        })
                      }}
                      className="mt-3 flex items-center gap-1 bg-green-50 border border-green-300 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <FileText size={14} /> Create Rental Agreement
                    </button>
                  )}
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAccept(req)}
                      disabled={accepting === req.id}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                    >
                      <Check size={15} />
                      {accepting === req.id ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <X size={15} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}