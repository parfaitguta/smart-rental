// frontend/src/pages/renter/PropertyDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProperty } from '../../api/propertyApi'
import { sendRequest } from '../../api/requestApi'
import { sendMessage } from '../../api/messageApi'
import { getPropertyReviews } from '../../api/reviewApi'
import { getPropertyImages } from '../../api/imageApi'
import { StarDisplay } from '../../components/common/StarRating'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { MapPin, Phone, ArrowLeft, Send, MessageSquare, Star, Navigation, ChevronLeft, ChevronRight, X, Edit, Users, FileText } from 'lucide-react'
import { formatCurrency, getStatusColor, formatDate } from '../../utils/helpers'

// Backend URL constant
const BACKEND_URL = 'http://192.168.1.102:5000';

// Function to open Google Maps
const openGoogleMaps = (latitude, longitude, address) => {
  const lat = latitude || -1.9441;
  const lng = longitude || 30.0619;
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
};

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requestMessage, setRequestMessage] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [messaging, setMessaging] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewData, setReviewData] = useState(null)
  const [images, setImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [user, setUser] = useState(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
        
        const propRes = await getProperty(id);
        const propertyData = propRes.data.property;
        setProperty(propertyData);
        
        // Check if current user is the owner
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setIsOwner(parsedUser.id === propertyData.landlord_id);
        }
        
        const revRes = await getPropertyReviews(id);
        setReviews(revRes.data.reviews);
        setReviewData(revRes.data.rating);
        
        try {
          const imgRes = await getPropertyImages(id);
          const imagesData = imgRes.data.images || [];
          const imageUrls = imagesData.map(img => `${BACKEND_URL}${img.image_url}`);
          setImages(imageUrls);
        } catch (imgError) {
          console.error('Error fetching images:', imgError);
          setImages([]);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Property not found');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id])

  const handleRequest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setRequesting(true)
    try {
      await sendRequest({ property_id: id, message: requestMessage })
      toast.success('Rental request sent successfully!')
      navigate('/my-requests')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    } finally {
      setRequesting(false)
    }
  }

  // Direct message to landlord - sends and navigates to chat
  const handleDirectMessage = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setMessaging(true)
    try {
      // Auto-send initial message to start conversation
      const defaultMessage = `Hi! I'm interested in your property "${property.title}". Is it still available?`;
      
      const response = await sendMessage({
        receiver_id: property.landlord_id,
        property_id: property.id,
        message: defaultMessage
      })
      
      toast.success('Message sent! Opening chat...')
      
      // Navigate directly to messages page
      // If the API returns conversation ID, pass it
      const conversationId = response?.data?.conversation_id || response?.conversation_id;
      if (conversationId) {
        navigate(`/messages?conversation=${conversationId}`);
      } else {
        navigate('/messages');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error(err.response?.data?.message || 'Failed to send message')
    } finally {
      setMessaging(false)
    }
  }

  const handleEditProperty = () => {
    navigate(`/landlord/edit-property/${property.id}`);
  };

  const handleManageRental = () => {
    navigate(`/landlord/rentals?property=${property.id}`);
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const getPropertyAddress = () => {
    return [property?.village, property?.cell, property?.sector, property?.district, property?.province]
      .filter(Boolean).join(', ')
  }

  if (loading) return <Spinner size="lg" />
  if (!property) return <div className="p-8 text-center text-red-500">Property not found</div>

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm">
        <ArrowLeft size={16} /> Back to Search
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        
        {/* Image Carousel Section */}
        <div className="relative bg-gray-900">
          {images.length > 0 ? (
            <>
              <img 
                src={images[currentImageIndex]} 
                alt={property.title}
                className="w-full h-64 md:h-96 object-contain bg-gray-900 cursor-pointer"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/800x500/e5e7eb/9ca3af?text=Image+Not+Found';
                }}
                onClick={() => setShowLightbox(true)}
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          ) : (
            <div className="w-full h-64 md:h-96 bg-gray-200 flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-500">No images available</span>
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 p-2 overflow-x-auto bg-gray-100 border-t">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition ${
                  currentImageIndex === idx ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <img 
                  src={img} 
                  alt={`Thumb ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {showLightbox && images.length > 0 && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setShowLightbox(false)}>
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition z-10"
            >
              <X size={24} />
            </button>
            <img 
              src={images[currentImageIndex]} 
              alt={property.title}
              className="max-w-[95vw] max-h-[95vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
                >
                  <ChevronLeft size={30} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
                >
                  <ChevronRight size={30} />
                </button>
              </>
            )}
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-xl font-bold text-gray-800 pr-4">{property.title}</h1>
            <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${getStatusColor(property.status)}`}>
              {property.status}
            </span>
          </div>

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

          {/* RENTER ONLY: Get Directions Button */}
          {!isOwner && (
            <button
              onClick={() => openGoogleMaps(property.latitude, property.longitude, getPropertyAddress())}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition mb-4"
            >
              <Navigation size={18} />
              Get Directions to Property
            </button>
          )}

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

          {/* RENTER ONLY: Rental Request Section */}
          {!isOwner && property.status === 'available' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to landlord (optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={e => setRequestMessage(e.target.value)}
                  placeholder="Introduce yourself or ask a question..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              
              {/* Two buttons side by side */}
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
                  onClick={handleDirectMessage}
                  disabled={messaging}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <MessageSquare size={15} />
                  {messaging ? 'Opening Chat...' : 'Message Landlord'}
                </button>
              </div>
            </div>
          )}

          {/* LANDLORD ONLY: Management Buttons */}
          {isOwner && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleEditProperty}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit Property
                </button>
                <button
                  onClick={handleManageRental}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Users size={16} />
                  Manage Rental
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                <FileText size={16} className="inline mr-2" />
                You are the owner of this property
              </div>
            </div>
          )}

          {!isOwner && property.status !== 'available' && (
            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm">
              This property is currently not available for rent
            </div>
          )}

          {/* Reviews Section - Visible to Everyone */}
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
    </div>
  )
}