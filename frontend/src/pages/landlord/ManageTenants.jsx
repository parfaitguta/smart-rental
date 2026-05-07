import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
  User, MapPin, Phone, Mail, CreditCard,
  AlertTriangle, CheckCircle, XCircle,
  FileText, Trash2, Plus, TrendingUp, Calendar, MessageSquare
} from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/helpers'
import TenantMonthSelector from '../../components/common/TenantMonthSelector'

const statusColors = {
  good: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  problematic: 'bg-red-100 text-red-700'
}

const statusIcons = {
  good: <CheckCircle size={14} />,
  warning: <AlertTriangle size={14} />,
  problematic: <XCircle size={14} />
}

const noteTypeColors = {
  general: 'bg-blue-50 border-blue-200 text-blue-700',
  warning: 'bg-red-50 border-red-200 text-red-700',
  compliment: 'bg-green-50 border-green-200 text-green-700',
  issue: 'bg-yellow-50 border-yellow-200 text-yellow-700'
}

export default function ManageTenants() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [tenantDetail, setTenantDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [showTerminateForm, setShowTerminateForm] = useState(false)
  const [noteForm, setNoteForm] = useState({ note: '', type: 'general' })
  const [terminateReason, setTerminateReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('payments')

  const startChat = (userId, userName, propertyTitle) => {
    navigate('/messages', { 
      state: { 
        startChat: true, 
        userId: userId, 
        userName: userName,
        propertyTitle: propertyTitle,
        userRole: 'tenant'
      } 
    })
  }

  const fetchTenants = async () => {
    try {
      const res = await api.get('/tenants')
      setTenants(res.data.tenants)
    } catch (err) {
      toast.error('Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  const fetchTenantDetail = async (rentalId) => {
    setLoadingDetail(true)
    try {
      const res = await api.get(`/tenants/${rentalId}`)
      setTenantDetail(res.data)
    } catch (err) {
      toast.error('Failed to load tenant details')
    } finally {
      setLoadingDetail(false)
    }
  }

  useEffect(() => { fetchTenants() }, [])

  useEffect(() => {
    if (selectedTenant) fetchTenantDetail(selectedTenant.id)
  }, [selectedTenant])

  const handleAddNote = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post(`/tenants/${selectedTenant.id}/notes`, noteForm)
      toast.success('Note added!')
      setShowNoteForm(false)
      setNoteForm({ note: '', type: 'general' })
      fetchTenantDetail(selectedTenant.id)
      fetchTenants()
    } catch (err) {
      toast.error('Failed to add note')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (status) => {
    try {
      await api.put(`/tenants/${selectedTenant.id}/status`, { tenant_status: status })
      toast.success(`Tenant status updated to ${status}`)
      fetchTenantDetail(selectedTenant.id)
      fetchTenants()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleTerminate = async (e) => {
    e.preventDefault()
    if (!window.confirm('Are you sure you want to terminate this tenancy?')) return
    setSubmitting(true)
    try {
      await api.put(`/tenants/${selectedTenant.id}/terminate`, { reason: terminateReason })
      toast.success('Tenancy terminated. Property is now available.')
      setShowTerminateForm(false)
      setSelectedTenant(null)
      setTenantDetail(null)
      fetchTenants()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to terminate')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return
    try {
      await api.delete(`/tenants/notes/${noteId}`)
      toast.success('Note deleted')
      fetchTenantDetail(selectedTenant.id)
    } catch (err) {
      toast.error('Failed to delete note')
    }
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div className="flex gap-6 h-full">
      {/* Tenant List */}
      <div className="w-80 shrink-0">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800">My Tenants</h1>
          <p className="text-gray-500 text-sm mt-1">{tenants.length} tenant(s)</p>
        </div>

        {tenants.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <User size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No tenants yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tenants.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTenant(t)}
                className={`bg-white rounded-xl p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow border-2 ${
                  selectedTenant?.id === t.id ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{t.tenant_name}</p>
                    <p className="text-gray-400 text-xs">{t.property_title}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${statusColors[t.tenant_status]}`}>
                    {statusIcons[t.tenant_status]} {t.tenant_status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                  <MapPin size={10} /> {t.district}, {t.province}
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-green-600 font-medium">✓ {t.paid_count} paid</span>
                  {t.overdue_count > 0 && (
                    <span className="text-red-500 font-medium">⚠ {t.overdue_count} overdue</span>
                  )}
                  {t.warning_count > 0 && (
                    <span className="text-yellow-600 font-medium">⚡ {t.warning_count} warnings</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tenant Detail */}
      <div className="flex-1">
        {!selectedTenant ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm h-64 flex flex-col items-center justify-center">
            <User size={48} className="text-gray-200 mb-3" />
            <p className="text-gray-400">Select a tenant to view details</p>
          </div>
        ) : loadingDetail ? (
          <Spinner size="lg" />
        ) : tenantDetail && (
          <div>
            {/* Tenant Header */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{tenantDetail.tenant.tenant_name}</h2>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail size={13} />{tenantDetail.tenant.tenant_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={13} />{tenantDetail.tenant.tenant_phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {['good', 'warning', 'problematic'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(s)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition-colors ${
                        tenantDetail.tenant.tenant_status === s
                          ? statusColors[s] + ' border-current'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agreement Info */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Property</p>
                  <p className="text-sm font-medium text-gray-700 truncate">{tenantDetail.tenant.property_title}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Monthly Rent</p>
                  <p className="text-sm font-bold text-blue-700">{formatCurrency(tenantDetail.tenant.monthly_rent)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Start Date</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(tenantDetail.tenant.start_date)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="text-sm font-medium text-gray-700 capitalize">{tenantDetail.tenant.status}</p>
                </div>
              </div>

              {/* Actions */}
              {tenantDetail.tenant.status === 'active' && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => startChat(
                      tenantDetail.tenant.tenant_id, 
                      tenantDetail.tenant.tenant_name, 
                      tenantDetail.tenant.property_title
                    )}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <MessageSquare size={14} /> Message Tenant
                  </button>
                  <button
                    onClick={() => navigate(`/landlord/tenants/${selectedTenant.id}/chart`)}
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <TrendingUp size={14} /> Payment Chart
                  </button>
                  <button
                    onClick={() => { setShowNoteForm(!showNoteForm); setShowTerminateForm(false) }}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <Plus size={14} /> Add Note
                  </button>
                  <button
                    onClick={() => { setShowTerminateForm(!showTerminateForm); setShowNoteForm(false) }}
                    className="flex items-center gap-1 border border-red-300 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <XCircle size={14} /> Terminate Tenancy
                  </button>
                </div>
              )}

              {/* Add Note Form */}
              {showNoteForm && (
                <form onSubmit={handleAddNote} className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-medium text-gray-700 mb-3">Add Note</h4>
                  <select
                    value={noteForm.type}
                    onChange={e => setNoteForm({ ...noteForm, type: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 w-full sm:w-auto"
                  >
                    <option value="general">General Note</option>
                    <option value="compliment">Compliment</option>
                    <option value="warning">Warning</option>
                    <option value="issue">Issue</option>
                  </select>
                  <textarea
                    value={noteForm.note}
                    onChange={e => setNoteForm({ ...noteForm, note: e.target.value })}
                    placeholder="Write your note here..."
                    rows={3}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={submitting}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">
                      {submitting ? 'Saving...' : 'Save Note'}
                    </button>
                    <button type="button" onClick={() => setShowNoteForm(false)}
                      className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Terminate Form */}
              {showTerminateForm && (
                <form onSubmit={handleTerminate} className="mt-4 bg-red-50 rounded-xl p-4 border border-red-200">
                  <h4 className="font-medium text-red-700 mb-2">⚠️ Terminate Tenancy</h4>
                  <p className="text-red-500 text-xs mb-3">
                    This will end the rental agreement and make the property available again.
                  </p>
                  <textarea
                    value={terminateReason}
                    onChange={e => setTerminateReason(e.target.value)}
                    placeholder="Reason for termination (required)..."
                    rows={3}
                    required
                    className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={submitting}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">
                      {submitting ? 'Terminating...' : 'Confirm Terminate'}
                    </button>
                    <button type="button" onClick={() => setShowTerminateForm(false)}
                      className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Termination info */}
              {tenantDetail.tenant.status === 'terminated' && tenantDetail.tenant.termination_reason && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 font-medium text-sm">Tenancy Terminated</p>
                  <p className="text-red-500 text-xs mt-1">Reason: {tenantDetail.tenant.termination_reason}</p>
                  <p className="text-red-400 text-xs mt-0.5">On: {formatDate(tenantDetail.tenant.terminated_at)}</p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'payments' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                <CreditCard size={14} /> Payments ({tenantDetail.payments.length})
              </button>
              <button
                onClick={() => setActiveTab('months')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'months' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                <Calendar size={14} /> Monthly Status
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'notes' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                <FileText size={14} /> Notes ({tenantDetail.notes.length})
              </button>
            </div>

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">Date</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">Amount</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">Method</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tenantDetail.payments.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No payments yet</td></tr>
                    ) : tenantDetail.payments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{formatDate(p.payment_date)}</td>
                        <td className="px-4 py-3 font-semibold text-blue-700">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-gray-500 capitalize">{p.method?.replace('_', ' ') || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            p.status === 'paid' ? 'bg-green-100 text-green-700' :
                            p.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{p.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Monthly Status Tab */}
            {activeTab === 'months' && (
              <div className="mt-4">
                <TenantMonthSelector
                  rentalId={selectedTenant.id}
                  tenantName={tenantDetail.tenant.tenant_name}
                  propertyTitle={tenantDetail.tenant.property_title}
                  monthlyRent={tenantDetail.tenant.monthly_rent}
                />
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-3">
                {tenantDetail.notes.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                    <p className="text-gray-400 text-sm">No notes yet. Add a note to track tenant behavior.</p>
                  </div>
                ) : tenantDetail.notes.map(n => (
                  <div key={n.id} className={`rounded-xl p-4 border ${noteTypeColors[n.type]}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-full bg-white bg-opacity-60">
                            {n.type}
                          </span>
                          <span className="text-xs opacity-70">{formatDate(n.created_at)}</span>
                        </div>
                        <p className="text-sm">{n.note}</p>
                        <p className="text-xs opacity-60 mt-1">By {n.author_name}</p>
                      </div>
                      <button onClick={() => handleDeleteNote(n.id)}
                        className="text-current opacity-50 hover:opacity-100 ml-3 shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}