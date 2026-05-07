import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { MapPin, User, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '../../utils/helpers'

export default function AdminProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const res = await api.get('/admin/properties')
      setProperties(res.data.properties || [])
    } catch (err) {
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete property "${title}"? This action cannot be undone.`)) return
    try {
      await api.delete(`/admin/properties/${id}`)
      toast.success('Property deleted successfully')
      fetchProperties()
    } catch (err) {
      toast.error('Failed to delete property')
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-700',
      rented: 'bg-blue-100 text-blue-700',
      maintenance: 'bg-yellow-100 text-yellow-700'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {status || 'unknown'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Property Management</h1>
        <p className="text-gray-500 text-sm mt-1">{properties.length} total properties</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Location</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Landlord</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Price</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Created</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {properties.map(prop => (
                <tr key={prop.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{prop.title}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{prop.district}, {prop.province}</span>
                    </div>
                   </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <User size={12} className="text-blue-500" />
                      <span>{prop.landlord_name}</span>
                    </div>
                   </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">{formatCurrency(prop.price)}</td>
                  <td className="px-4 py-3">{getStatusBadge(prop.status)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(prop.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(prop.id, prop.title)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}