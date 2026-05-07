import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyProperties, deleteProperty } from '../../api/propertyApi'
import { getPropertyImages, uploadImages, deleteImage, setPrimaryImage } from '../../api/imageApi'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { Plus, MapPin, Trash2, ImagePlus, Star, X } from 'lucide-react'
import { formatCurrency, getStatusColor } from '../../utils/helpers'

const IMAGE_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000'

export default function MyProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState({})
  const [uploadingFor, setUploadingFor] = useState(null)

  const fetchProperties = async () => {
    try {
      const res = await getMyProperties()
      setProperties(res.data.properties)
      const imageMap = {}
      await Promise.all(res.data.properties.map(async (p) => {
        const imgRes = await getPropertyImages(p.id)
        imageMap[p.id] = imgRes.data.images
      }))
      setImages(imageMap)
    } catch (err) {
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProperties() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return
    try {
      await deleteProperty(id)
      toast.success('Property deleted')
      fetchProperties()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleImageUpload = async (propertyId, e) => {
    const files = e.target.files
    if (!files.length) return
    setUploadingFor(propertyId)
    try {
      const formData = new FormData()
      Array.from(files).forEach(f => formData.append('images', f))
      await uploadImages(propertyId, formData)
      toast.success('Images uploaded!')
      fetchProperties()
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setUploadingFor(null)
    }
  }

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteImage(imageId)
      toast.success('Image deleted')
      fetchProperties()
    } catch (err) {
      toast.error('Failed to delete image')
    }
  }

  const handleSetPrimary = async (imageId) => {
    try {
      await setPrimaryImage(imageId)
      toast.success('Primary image updated')
      fetchProperties()
    } catch (err) {
      toast.error('Failed to update primary image')
    }
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Properties</h1>
          <p className="text-gray-500 text-sm mt-1">{properties.length} properties listed</p>
        </div>
        <Link to="/landlord/properties/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-400 mb-4">No properties yet</p>
          <Link to="/landlord/properties/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Add Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm overflow-hidden">

              {images[p.id]?.find(i => i.is_primary) ? (
                <img
                  src={`${IMAGE_BASE}${images[p.id].find(i => i.is_primary).image_url}`}
                  alt={p.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <ImagePlus size={32} className="text-gray-300" />
                </div>
              )}

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm pr-2">{p.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                  <MapPin size={12} /> {p.district}, {p.province}
                </div>

                <p className="text-blue-700 font-bold mb-3">
                  {formatCurrency(p.price)}<span className="text-gray-400 text-xs font-normal">/month</span>
                </p>

                {images[p.id]?.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {images[p.id].map(img => (
                      <div key={img.id} className="relative group">
                        <img
                          src={`${IMAGE_BASE}${img.image_url}`}
                          alt=""
                          className={`w-14 h-14 object-cover rounded-lg border-2 ${img.is_primary ? 'border-blue-500' : 'border-gray-200'}`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center gap-1 transition-opacity">
                          {!img.is_primary && (
                            <button onClick={() => handleSetPrimary(img.id)}
                              className="text-yellow-400 hover:text-yellow-300">
                              <Star size={12} />
                            </button>
                          )}
                          <button onClick={() => handleDeleteImage(img.id)}
                            className="text-red-400 hover:text-red-300">
                            <X size={12} />
                          </button>
                        </div>
                        {img.is_primary && (
                          <span className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                            <Star size={8} className="text-white" />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <label className={`flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer ${uploadingFor === p.id ? 'opacity-60' : ''}`}>
                    <ImagePlus size={13} />
                    {uploadingFor === p.id ? 'Uploading...' : 'Add Images'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(p.id, e)}
                      disabled={uploadingFor === p.id}
                    />
                  </label>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}