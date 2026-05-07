import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProperty } from '../api/propertyApi'
import { getPropertyImages } from '../api/imageApi'
import { MapPin, Phone, ArrowLeft, LogIn, Building2 } from 'lucide-react'
import { formatCurrency, getStatusColor } from '../utils/helpers'

const IMAGE_BASE = 'http://localhost:5000'

export default function PropertyView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [images, setImages] = useState([])
  const [activeImage, setActiveImage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProperty(id), getPropertyImages(id)])
      .then(([propRes, imgRes]) => {
        setProperty(propRes.data.property)
        setImages(imgRes.data.images)
        const primary = imgRes.data.images.find(i => i.is_primary)
        setActiveImage(primary || imgRes.data.images[0])
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  )

  if (!property) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Building2 size={24} /> Smart Rental RW
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login"
            className="text-sm text-blue-100 hover:text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Sign In
          </Link>
          <Link to="/register"
            className="text-sm bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50">
            Register
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft size={16} /> Back to listings
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Main Image */}
          {activeImage ? (
            <img
              src={`${IMAGE_BASE}${activeImage.image_url}`}
              alt={property.title}
              className="w-full h-72 object-cover"
            />
          ) : (
            <div className="w-full h-72 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Building2 size={64} className="text-blue-300" />
            </div>
          )}

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {images.map(img => (
                <img
                  key={img.id}
                  src={`${IMAGE_BASE}${img.image_url}`}
                  alt=""
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 shrink-0 ${
                    activeImage?.id === img.id ? 'border-blue-500' : 'border-gray-200'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-800 pr-4">{property.title}</h1>
              <span className={`text-sm px-3 py-1 rounded-full font-medium shrink-0 ${getStatusColor(property.status)}`}>
                {property.status}
              </span>
            </div>

            <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
              <MapPin size={15} />
              {[property.village, property.cell, property.sector, property.district, property.province]
                .filter(Boolean).join(', ')}
            </div>

            <p className="text-3xl font-bold text-blue-700 mb-4">
              {formatCurrency(property.price)}
              <span className="text-gray-400 text-base font-normal">/month</span>
            </p>

            {property.description && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>
              </div>
            )}

            <div className="border-t pt-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Listed by</p>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone size={14} className="text-green-500" />
                {property.landlord_name} — {property.landlord_phone}
              </div>
            </div>

            {/* CTA for non-logged in users */}
            {property.status === 'available' && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                <h3 className="font-bold text-gray-800 text-lg mb-2">
                  Interested in this property?
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Create a free account to send a rental request and message the landlord directly.
                </p>
                <div className="flex justify-center gap-3">
                  <Link to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <LogIn size={16} /> Register & Request
                  </Link>
                  <Link to="/login"
                    className="border border-blue-300 text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-xl text-sm font-medium">
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}