// frontend/src/pages/renter/SearchProperties.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProperties } from '../../api/propertyApi';
import { getPropertyImages } from '../../api/imageApi';
import { MapPin, Bed, Bath, Home as HomeIcon, Search, Filter, X, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { BASE_URL } from '../../config';
import api from '../../api/axios';

export default function SearchProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    province: '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await getProperties();
      const propertiesData = response.data.properties || [];
      
      const propertiesWithImages = await Promise.all(
        propertiesData.map(async (property) => {
          try {
            const imagesRes = await getPropertyImages(property.id);
            const images = imagesRes.data.images || [];
            const primaryImage = images.find(img => img.is_primary === 1) || images[0];
            return {
              ...property,
              primaryImage: primaryImage?.image_url || null,
              imageCount: images.length
            };
          } catch (error) {
            return { ...property, primaryImage: null, imageCount: 0 };
          }
        })
      );
      
      setProperties(propertiesWithImages);
      setFilteredProperties(propertiesWithImages);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = [...properties];
    
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.province?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseFloat(filters.maxPrice));
    }
    if (filters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= parseInt(filters.bedrooms));
    }
    if (filters.province) {
      filtered = filtered.filter(property => property.province?.toLowerCase() === filters.province.toLowerCase());
    }
    
    setFilteredProperties(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, filters]);

  const clearFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', bedrooms: '', province: '' });
    setSearchTerm('');
    setShowFilters(false);
  };

  // Direct message - send and navigate to chat
  const handleMessageLandlord = async (e, property) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSendingMessage(property.id);
    
    try {
      const response = await api.post('/messages', {
        receiver_id: property.landlord_id,
        property_id: property.id,
        message: `Hi! I'm interested in your property "${property.title}". Is it still available?`,
        subject: `Inquiry about: ${property.title}`
      });

      if (response.data.success) {
        const conversationId = response.data.conversation_id || response.data.data?.conversation_id;
        if (conversationId) {
          navigate(`/messages?conversation=${conversationId}`);
        } else {
          navigate('/messages');
        }
      } else {
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Could not send message. Please try again.');
    } finally {
      setSendingMessage(null);
    }
  };

  const provinces = ['Kigali', 'Northern', 'Southern', 'Eastern', 'Western'];

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Properties</h1>
        
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by title, district, or province..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Filter Properties</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (RWF)</label>
              <input
                type="number"
                placeholder="e.g., 100000"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (RWF)</label>
              <input
                type="number"
                placeholder="e.g., 500000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <select
                value={filters.province}
                onChange={(e) => setFilters({ ...filters, province: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Found <span className="font-semibold text-blue-600">{filteredProperties.length}</span> properties
        </p>
      </div>

      {/* Properties Grid - FIXED: No nested <a> tags */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <HomeIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No properties found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const imageUrl = getImageUrl(property.primaryImage);
            return (
              <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Clickable image section - wraps only the image */}
                <Link to={`/property/${property.id}`} className="block">
                  <div className="relative h-48 bg-gray-200">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/600x400/e5e7eb/9ca3af?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                        <HomeIcon className="w-12 h-12 mb-2" />
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        property.status === 'available' ? 'bg-green-500 text-white' :
                        property.status === 'rented' ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {property.status || 'Available'}
                      </span>
                    </div>
                    
                    {property.imageCount > 0 && (
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        📸 {property.imageCount}
                      </div>
                    )}
                  </div>
                </Link>
                
                {/* Content Section - No Link wrapper here */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{property.district}, {property.province}</span>
                  </div>
                  
                  <p className="text-blue-600 font-bold text-xl mb-3">
                    {formatCurrency(property.price)}
                    <span className="text-gray-400 text-sm font-normal">/month</span>
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{property.bedrooms || 0} beds</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span>{property.bathrooms || 0} baths</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📐</span>
                      <span>{property.size || 0} m²</span>
                    </div>
                  </div>

                  {/* Action Buttons - No nested Links */}
                  <div className="flex gap-2">
                    <Link
                      to={`/property/${property.id}`}
                      className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={(e) => handleMessageLandlord(e, property)}
                      disabled={sendingMessage === property.id}
                      className="flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-green-300 disabled:cursor-not-allowed"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {sendingMessage === property.id ? 'Sending...' : 'Message'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}