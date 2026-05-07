import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProperties } from '../../api/propertyApi'
import Spinner from '../../components/common/Spinner'
import { MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { formatCurrency, getStatusColor } from '../../utils/helpers'

const provinces = ['Kigali', 'Northern', 'Southern', 'Eastern', 'Western']

export default function SearchProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    province: '', district: '', min_price: '', max_price: ''
  })
  const navigate = useNavigate()

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      )
      const res = await getProperties(params)
      setProperties(res.data.properties)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProperties() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProperties()
  }

  const handleReset = () => {
    setFilters({ province: '', district: '', min_price: '', max_price: '' })
    setTimeout(fetchProperties, 100)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Find a House</h1>
        <p className="text-gray-500 text-sm mt-1">Search available rental properties across Rwanda</p>
      </div>

      {/* Search Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-700">Filter Properties</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Province</label>
            <select
              value={filters.province}
              onChange={e => setFilters({ ...filters, province: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Provinces</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
            <input
              type="text"
              value={filters.district}
              onChange={e => setFilters({ ...filters, district: e.target.value })}
              placeholder="e.g. Gasabo"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Min Price (RWF)</label>
            <input
              type="number"
              value={filters.min_price}
              onChange={e => setFilters({ ...filters, min_price: e.target.value })}
              placeholder="e.g. 50000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Price (RWF)</label>
            <input
              type="number"
              value={filters.max_price}
              onChange={e => setFilters({ ...filters, max_price: e.target.value })}
              placeholder="e.g. 200000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Search size={15} /> Search
          </button>
          <button type="button" onClick={handleReset}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-2 rounded-lg text-sm">
            Reset
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? <Spinner size="lg" /> : (
        <>
          <p className="text-gray-500 text-sm mb-4">{properties.length} properties found</p>
          {properties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-400">No properties found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(p => (
                <div key={p.id}
                  onClick={() => navigate(`/property/${p.id}`)}
                  className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-blue-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight pr-2">{p.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                    <MapPin size={12} /> {p.sector ? `${p.sector}, ` : ''}{p.district}, {p.province}
                  </div>
                  {p.description && (
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <p className="text-blue-700 font-bold">
                      {formatCurrency(p.price)}<span className="text-gray-400 text-xs font-normal">/mo</span>
                    </p>
                    <span className="text-xs text-gray-500">by {p.landlord_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}