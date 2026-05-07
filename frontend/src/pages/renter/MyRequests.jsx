import { useState, useEffect } from 'react'
import { getRenterRequests } from '../../api/requestApi'
import Spinner from '../../components/common/Spinner'
import { MapPin, Phone } from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers'

export default function MyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRenterRequests()
      .then(res => setRequests(res.data.requests))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner size="lg" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>
        <p className="text-gray-500 text-sm mt-1">{requests.length} rental requests sent</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-400">You haven't sent any rental requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800">{req.property_title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                <MapPin size={12} /> {req.district}, {req.province}
              </div>
              <p className="text-blue-700 font-semibold text-sm mb-2">{formatCurrency(req.price)}/month</p>
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <Phone size={12} /> Landlord: {req.landlord_name} — {req.landlord_phone}
              </div>
              {req.message && (
                <p className="text-gray-400 text-xs italic">Your message: "{req.message}"</p>
              )}
              <p className="text-gray-400 text-xs mt-2">Sent: {formatDate(req.created_at)}</p>

              {req.status === 'accepted' && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                  ✅ Your request was accepted! The landlord will contact you soon.
                </div>
              )}
              {req.status === 'rejected' && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                  ❌ This request was rejected. Try other properties.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}