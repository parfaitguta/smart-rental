import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addProperty } from '../../api/propertyApi'
import toast from 'react-hot-toast'
import { Save, ArrowLeft } from 'lucide-react'

const provinces = ['Kigali', 'Northern', 'Southern', 'Eastern', 'Western']

export default function AddProperty() {
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    province: '', district: '', sector: '', cell: '', village: '',
    latitude: '', longitude: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addProperty(form)
      toast.success('Property added successfully!')
      navigate('/landlord/properties')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add property')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'title', label: 'Property Title', placeholder: 'e.g. Modern 2-Bedroom in Kimironko', type: 'text', required: true, full: true },
    { name: 'price', label: 'Monthly Rent (RWF)', placeholder: 'e.g. 150000', type: 'number', required: true },
    { name: 'province', label: 'Province', type: 'select', required: true },
    { name: 'district', label: 'District', placeholder: 'e.g. Gasabo', type: 'text', required: true },
    { name: 'sector', label: 'Sector', placeholder: 'e.g. Kimironko', type: 'text' },
    { name: 'cell', label: 'Cell', placeholder: 'e.g. Bibare', type: 'text' },
    { name: 'village', label: 'Village', placeholder: 'e.g. Amahoro', type: 'text' },
    { name: 'latitude', label: 'Latitude (GPS)', placeholder: 'e.g. -1.9355', type: 'number' },
    { name: 'longitude', label: 'Longitude (GPS)', placeholder: 'e.g. 30.1034', type: 'number' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Property</h1>
          <p className="text-gray-500 text-sm">Fill in the details of your property</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
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
            {loading ? 'Saving...' : 'Save Property'}
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