// frontend/src/pages/landlord/AddProperty.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addProperty, getProperty, updateProperty } from '../../api/propertyApi'
import { uploadImages, getPropertyImages, deleteImage, setPrimaryImage } from '../../api/imageApi'
import toast from 'react-hot-toast'
import { Save, ArrowLeft, Upload, X } from 'lucide-react'

const provinces = ['Kigali', 'Northern', 'Southern', 'Eastern', 'Western']
const BACKEND_URL = 'http://192.168.1.102:5000'

export default function AddProperty() {
  const navigate = useNavigate()
  const { id } = useParams() // Get ID from URL for editing
  const isEditMode = !!id // Check if we're in edit mode
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditMode)
  const [selectedImages, setSelectedImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    bedrooms: '', bathrooms: '', size: '',
    province: '', district: '', sector: '', cell: '', village: '',
    latitude: '', longitude: '', status: 'available'
  })

  // Load property data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchPropertyData()
    }
  }, [id, isEditMode])

  const fetchPropertyData = async () => {
    try {
      setFetching(true)
      // Fetch property details
      const response = await getProperty(id)
      const property = response.data.property
      
      setForm({
        title: property.title || '',
        description: property.description || '',
        price: property.price || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        size: property.size || '',
        province: property.province || '',
        district: property.district || '',
        sector: property.sector || '',
        cell: property.cell || '',
        village: property.village || '',
        latitude: property.latitude || '',
        longitude: property.longitude || '',
        status: property.status || 'available'
      })
      
      // Fetch existing images
      try {
        const imagesRes = await getPropertyImages(id)
        const images = imagesRes.data.images || []
        setExistingImages(images)
      } catch (error) {
        console.error('Error fetching images:', error)
        setExistingImages([])
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      toast.error('Failed to load property data')
      navigate('/landlord/properties')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + imagePreviews.length > 10) {
      toast.error('You can only upload up to 10 images')
      return
    }
    
    setSelectedImages([...selectedImages, ...files])
    
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      file: file
    }))
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const removeSelectedImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index].url)
    const newPreviews = [...imagePreviews]
    newPreviews.splice(index, 1)
    setImagePreviews(newPreviews)
    
    const newImages = [...selectedImages]
    newImages.splice(index, 1)
    setSelectedImages(newImages)
  }

  const handleDeleteExistingImage = async (imageId) => {
    if (window.confirm('Delete this image?')) {
      try {
        await deleteImage(imageId)
        setExistingImages(existingImages.filter(img => img.id !== imageId))
        toast.success('Image deleted')
      } catch (error) {
        toast.error('Failed to delete image')
      }
    }
  }

  const handleSetPrimary = async (imageId) => {
    try {
      await setPrimaryImage(imageId)
      setExistingImages(existingImages.map(img => ({
        ...img,
        is_primary: img.id === imageId ? 1 : 0
      })))
      toast.success('Primary image updated')
    } catch (error) {
      toast.error('Failed to set primary image')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      let propertyId = id
      
      if (isEditMode) {
        // Update existing property
        await updateProperty(id, form)
        propertyId = id
        toast.success('Property updated successfully!')
      } else {
        // Create new property
        const response = await addProperty(form)
        propertyId = response.data.propertyId
        toast.success('Property added successfully!')
      }
      
      // Upload new images if any
      if (selectedImages.length > 0) {
        const imageFormData = new FormData()
        selectedImages.forEach(file => {
          imageFormData.append('images', file)
        })
        await uploadImages(propertyId, imageFormData)
        toast.success(`${selectedImages.length} image(s) uploaded!`)
      }
      
      navigate('/landlord/properties')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save property')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'title', label: 'Property Title', placeholder: 'e.g. Modern 2-Bedroom in Kimironko', type: 'text', required: true, full: true },
    { name: 'price', label: 'Monthly Rent (RWF)', placeholder: 'e.g. 150000', type: 'number', required: true },
    { name: 'bedrooms', label: 'Bedrooms', placeholder: 'e.g. 2', type: 'number' },
    { name: 'bathrooms', label: 'Bathrooms', placeholder: 'e.g. 2', type: 'number' },
    { name: 'size', label: 'Size (m²)', placeholder: 'e.g. 120', type: 'number' },
    { name: 'province', label: 'Province', type: 'select', required: true },
    { name: 'district', label: 'District', placeholder: 'e.g. Gasabo', type: 'text', required: true },
    { name: 'sector', label: 'Sector', placeholder: 'e.g. Kimironko', type: 'text' },
    { name: 'cell', label: 'Cell', placeholder: 'e.g. Bibare', type: 'text' },
    { name: 'village', label: 'Village', placeholder: 'e.g. Amahoro', type: 'text' },
    { name: 'latitude', label: 'Latitude (GPS)', placeholder: 'e.g. -1.9355', type: 'number' },
    { name: 'longitude', label: 'Longitude (GPS)', placeholder: 'e.g. 30.1034', type: 'number' },
  ]

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEditMode ? 'Update your property details' : 'Fill in the details of your property'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* Image Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Photos
          </label>
          
          {/* Existing Images (Edit Mode) */}
          {isEditMode && existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Photos:</p>
              <div className="grid grid-cols-4 gap-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={`${BACKEND_URL}${img.image_url}`}
                      alt="Property"
                      className="w-full h-20 object-cover rounded"
                    />
                    {img.is_primary === 1 && (
                      <span className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 rounded">Primary</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                      {img.is_primary !== 1 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(img.id)}
                          className="bg-yellow-500 text-white text-xs px-1 py-0.5 rounded"
                        >
                          ★
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        className="bg-red-500 text-white text-xs px-1 py-0.5 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* New Images Preview */}
          {imagePreviews.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">New Photos:</p>
              <div className="grid grid-cols-4 gap-2">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <img src={preview.url} alt="Preview" className="w-full h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-400 mt-2">Upload up to 10 images (JPG, PNG)</p>
        </div>

        {/* Status Field for Edit Mode */}
        {isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.name} className={f.full ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              {f.type === 'select' ? (
                <select
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  required={f.required}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select province</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={16} />
            {loading ? 'Saving...' : (isEditMode ? 'Update Property' : 'Save Property')}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2.5 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}