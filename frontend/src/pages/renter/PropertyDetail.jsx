// frontend/src/pages/renter/PropertyDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProperty } from '../../api/propertyApi'
import { sendRequest } from '../../api/requestApi'
import { sendMessage } from '../../api/messageApi'
import { getPropertyReviews } from '../../api/reviewApi'
import { StarDisplay } from '../../components/common/StarRating'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { MapPin, Phone, ArrowLeft, Send, MessageSquare, Star, Navigation } from 'lucide-react'
import { formatCurrency, getStatusColor, formatDate } from '../../utils/helpers'

// Function to open Google Maps
const openGoogleMaps = (latitude, longitude, address) => {
  const lat = latitude || -1.9441;
  const lng = longitude || 30.0619;
  const encodedAddress = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
};

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [messaging, setMessaging] = useState(false)
  const [showMessageBox, setShowMessageBox] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewData, setReviewData] = useState(null)

  useEffect(() => {
    Promise.all([getProperty(id), getPropertyReviews(id)])
      .then(([propRes, revRes]) => {
        setProperty(propRes.data.property)
        setReviews(revRes.data.reviews)
        setReviewData(revRes.data.rating)
      })
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleRequest = async () => {
    setRequesting(true)
    try {
      await sendRequest({ property_id: id, message })
      toast.success('Rental request sent successfully!')
      navigate('/my-requests')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    } finally {
      setRequesting(false)
    }
  }

  const handleMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setMessaging(true)
    try {
      await sendMessage({
        receiver_id: property.landlord_id,
        property_id: property.id,
        message
      })
      toast.success('Message sent to landlord!')
      setMessage('')
      setShowMessageBox(false)
      navigate('/messages')
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setMessaging(false)
    }
  }

  // Get address for directions
  const getPropertyAddress = () => {
    return [property?.village, property?.cell, property?.sector, property?.district, property?.province]
      .filter(Boolean).join(', ');
  };

  if (loading) return <Spinner size="lg" />
  if (!property) return <div className="p-8 text-center text-red-500">Property not found</div>

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm">
        <ArrowLeft size={16} /> Back to Search
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-xl font-bold text-gray-800 pr-4">{property.title}</h1>
          <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>

        {/* Rating summary */}
        {reviewData && parseInt(reviewData.total_reviews) > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <StarDisplay rating={Math.round(parseFloat(reviewData.average_rating))} size={14} />
            <span className="text-sm text-gray-600 font-medium">
              {parseFloat(reviewData.average_rating).toFixed(1)}
            </span>
            <span className="text-gray-400 text-sm">
              ({reviewData.total_reviews} review{reviewData.total_reviews > 1 ? 's' : ''})
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
          <MapPin size={14} />
          {getPropertyAddress()}
        </div>

        <p className="text-3xl font-bold text-blue-700 mb-2">
          {formatCurrency(property.price)}
          <span className="text-gray-400 text-sm font-normal">/month</span>
        </p>

        {/* GET DIRECTIONS BUTTON - Added here */}
        <button
          onClick={() => openGoogleMaps(property.latitude, property.longitude, getPropertyAddress())}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition mb-4"
        >
          <Navigation size={18} />
          Get Directions to Property
        </button>

        {property.description && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-600 text-sm">{property.description}</p>
          </div>
        )}

        <div className="border-t pt-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">Listed by</p>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Phone size={14} className="text-green-500" />
            {property.landlord_name} — {property.landlord_phone}
          </div>
        </div>

        {property.status === 'available' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message to landlord (optional)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Introduce yourself or ask a question..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRequest}
                disabled={requesting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send size={15} />
                {requesting ? 'Sending...' : 'Send Rental Request'}
              </button>
              <button
                onClick={() => setShowMessageBox(!showMessageBox)}
                className="border border-blue-300 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <MessageSquare size={15} /> Message
              </button>
            </div>

            {showMessageBox && (
              <form onSubmit={handleMessage} className="bg-blue-50 rounded-lg p-4 space-y-2">
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type your message to the landlord..."
                  rows={3}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                />
                <button type="submit" disabled={messaging}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">
                  {messaging ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        )}

        {property.status !== 'available' && (
          <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm">
            This property is currently not available for rent
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-6 border-t pt-5">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              Reviews ({reviewData?.total_reviews})
              <span className="text-yellow-500 font-bold">
                {parseFloat(reviewData?.average_rating || 0).toFixed(1)} ★
              </span>
            </h3>
            <div className="space-y-3">
              {reviews.map(rev => (
                <div key={rev.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-700">{rev.renter_name}</p>
                    <StarDisplay rating={rev.rating} size={12} />
                  </div>
                  {rev.comment && (
                    <p className="text-gray-500 text-xs italic">"{rev.comment}"</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">{formatDate(rev.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}