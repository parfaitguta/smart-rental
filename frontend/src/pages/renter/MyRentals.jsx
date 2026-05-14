import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTenantRentals } from '../../api/rentalApi'
import { getTenantPayments } from '../../api/paymentApi'
import { getTenantPaymentRequests } from '../../api/paymentRequestApi'
import { downloadLease } from '../../api/leaseApi'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { MapPin, Calendar, CreditCard, AlertCircle, Download, FileText, MessageSquare } from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers'
import MonthlyPaymentSelector from '../../components/common/MonthlyPaymentSelector'

const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : 'http://localhost:5000/api'

export default function MyRentals() {
  const navigate = useNavigate()
  const [rentals, setRentals] = useState([])
  const [payments, setPayments] = useState([])
  const [paymentRequests, setPaymentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCalculator, setShowCalculator] = useState(null)
  const [downloadingLease, setDownloadingLease] = useState(null)

  const messageLandlord = (landlordId, landlordName, propertyTitle) => {
    navigate('/messages', {
      state: {
        startChat: true,
        userId: landlordId,
        userName: landlordName,
        propertyTitle: propertyTitle,
        userRole: 'landlord'
      }
    })
  }

  useEffect(() => {
    Promise.all([
      getTenantRentals(),
      getTenantPayments(),
      getTenantPaymentRequests()
    ])
      .then(([r, p, pr]) => {
        setRentals(r.data.rentals || [])
        setPayments(p.data.payments || [])
        setPaymentRequests(pr.data.requests || [])
      })
      .catch(err => {
        console.error('Failed to load rentals:', err.message)
        setRentals([])
        setPayments([])
        setPaymentRequests([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/receipts/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        toast.error('Receipt not available')
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

  const handleDownloadLease = async (rentalId) => {
    setDownloadingLease(rentalId)
    try {
      await downloadLease(rentalId)
      toast.success('Lease agreement downloaded successfully!')
    } catch (err) {
      console.error('Lease download error:', err)
      // Show more specific error message
      if (err.message === 'Failed to generate lease') {
        toast.error('Could not generate lease. Please contact landlord.')
      } else if (err.message === 'Network request failed') {
        toast.error('Network error. Check your connection.')
      } else {
        toast.error(err.message || 'Failed to download lease')
      }
    } finally {
      setDownloadingLease(null)
    }
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Rentals</h1>
        <p className="text-gray-500 text-sm mt-1">{rentals.length} rental agreement(s)</p>
      </div>

      {rentals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-400">No active rentals yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rentals.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{r.property_title}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <MapPin size={12} /> {r.district}, {r.province}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Landlord: {r.landlord_name}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(r.status)}`}>
                    {r.status}
                  </span>
                  <button
                    onClick={() => messageLandlord(r.landlord_id, r.landlord_name, r.property_title)}
                    className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50"
                  >
                    <MessageSquare size={12} /> Message Landlord
                  </button>
                  <button
                    onClick={() => handleDownloadLease(r.id)}
                    disabled={downloadingLease === r.id}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                  >
                    <Download size={12} />
                    {downloadingLease === r.id ? 'Downloading...' : 'Lease Agreement'}
                  </button>
                  <button
                    onClick={() => setShowCalculator(showCalculator === r.id ? null : r.id)}
                    className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50"
                  >
                    <Calendar size={12} /> {showCalculator === r.id ? 'Hide' : 'View'} Payment Status
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {formatDate(r.start_date)} → {r.end_date ? formatDate(r.end_date) : 'Ongoing'}
                </span>
                <span className="font-semibold text-blue-700">
                  {formatCurrency(r.monthly_rent)}/month
                </span>
              </div>

              {/* Payment Requests Section */}
              {paymentRequests.filter(pr => pr.rental_id === r.id).length > 0 && (
                <div className="border-t pt-3 mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <AlertCircle size={14} className="text-orange-500" />
                    Payment Requests from Landlord
                  </p>
                  <div className="space-y-2">
                    {paymentRequests.filter(pr => pr.rental_id === r.id).map(pr => (
                      <div key={pr.id} className={`flex justify-between items-center p-3 rounded-lg border text-sm ${
                        pr.status === 'paid' ? 'bg-green-50 border-green-200' :
                        pr.status === 'overdue' ? 'bg-red-50 border-red-200' :
                        'bg-orange-50 border-orange-200'
                      }`}>
                        <div>
                          <p className="font-medium text-gray-800">{pr.month_year}</p>
                          {pr.note && (
                            <p className="text-xs text-gray-500 mt-0.5">"{pr.note}"</p>
                          )}
                          <p className="text-xs text-gray-400">Due: {formatDate(pr.due_date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-700">{formatCurrency(pr.amount)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            pr.status === 'paid' ? 'bg-green-100 text-green-700' :
                            pr.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {pr.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment History Section */}
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <CreditCard size={14} /> Payment History
                </p>
                {payments.filter(p => p.rental_id === r.id).length === 0 ? (
                  <p className="text-gray-400 text-xs">No payments recorded yet</p>
                ) : (
                  <div className="space-y-1">
                    {payments.filter(p => p.rental_id === r.id).map(pay => (
                      <div key={pay.id}
                        className="flex justify-between items-center text-xs text-gray-600 py-1.5 border-b border-gray-50 gap-2 flex-wrap">
                        <span>{formatDate(pay.payment_date)}</span>
                        <span className="font-medium">{formatCurrency(pay.amount)}</span>
                        <span className="capitalize">{pay.method?.replace('_', ' ') || 'N/A'}</span>
                        <span className={`px-2 py-0.5 rounded-full ${getStatusColor(pay.status)}`}>
                          {pay.status}
                        </span>
                        {pay.status === 'paid' && (
                          <button
                            onClick={() => handleDownloadReceipt(pay.id)}
                            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                          >
                            <Download size={12} /> Receipt
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {showCalculator === r.id && (
                <div className="mt-4 border-t pt-4">
                  <MonthlyPaymentSelector rentalId={r.id} userRole="renter" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}