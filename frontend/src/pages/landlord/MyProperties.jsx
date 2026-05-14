// frontend/src/pages/landlord/MyProperties.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProperties, deleteProperty } from '../../api/propertyApi';
import { getPropertyImages } from '../../api/imageApi';
import toast from 'react-hot-toast';

// Use production URL directly
const PRODUCTION_URL = 'https://smart-rental-cqr0.onrender.com';

// Function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it already has the old local IP, replace it
  if (imagePath.includes('192.168.1.102:5000')) {
    return imagePath.replace('http://192.168.1.102:5000', PRODUCTION_URL);
  }
  
  // If already a full URL with production, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise prepend the production URL
  return `${PRODUCTION_URL}${imagePath}`;
};

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await getMyProperties();
      const propertiesData = response.data.properties || [];
      console.log('Properties data:', propertiesData);

      // Fetch images for each property
      const propertiesWithImages = await Promise.all(
        propertiesData.map(async (property) => {
          try {
            const imagesRes = await getPropertyImages(property.id);
            const images = imagesRes.data.images || [];
            const primaryImage = images.find(img => img.is_primary === 1) || images[0];
            
            console.log(`Property ${property.id} image path:`, primaryImage?.image_url);

            return {
              ...property,
              primaryImage: primaryImage?.image_url || null,
              imageCount: images.length,
              bedrooms: property.bedrooms || 0,
              bathrooms: property.bathrooms || 0,
              size: property.size || 0
            };
          } catch (error) {
            console.error('Error fetching images for property:', property.id);
            return {
              ...property,
              primaryImage: null,
              imageCount: 0,
              bedrooms: property.bedrooms || 0,
              bathrooms: property.bathrooms || 0,
              size: property.size || 0
            };
          }
        })
      );

      setProperties(propertiesWithImages);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setDeleting(id);
      try {
        await deleteProperty(id);
        toast.success('Property deleted successfully');
        fetchProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Failed to delete property');
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Group properties by status
  const availableProperties = properties.filter(p => p.status === 'available');
  const rentedProperties = properties.filter(p => p.status === 'rented');
  const inactiveProperties = properties.filter(p => p.status === 'inactive');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Properties</h1>
        <Link
          to="/landlord/add-property"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 text-lg">No properties yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Property" to get started</p>
        </div>
      ) : (
        <>
          {/* Available Properties Section */}
          {availableProperties.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Available ({availableProperties.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onDelete={handleDelete}
                    deleting={deleting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rented Properties Section */}
          {rentedProperties.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-yellow-700 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                Rented ({rentedProperties.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rentedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onDelete={handleDelete}
                    deleting={deleting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Properties Section */}
          {inactiveProperties.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Inactive ({inactiveProperties.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onDelete={handleDelete}
                    deleting={deleting}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Property Card Component
function PropertyCard({ property, onDelete, deleting }) {
  const imageUrl = getImageUrl(property.primaryImage);
  
  console.log('Property:', property.title, 'Image URL:', imageUrl);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rented': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'rented': return 'Rented';
      case 'inactive': return 'Inactive';
      default: return status || 'Available';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x400/e5e7eb/9ca3af?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">No Image</span>
          </div>
        )}

        {/* Image Count Badge */}
        {property.imageCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            📸 {property.imageCount}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{property.district}, {property.province}</span>
        </div>

        <p className="text-blue-600 font-bold text-xl mb-3">
          RWF {Number(property.price).toLocaleString()}
          <span className="text-gray-400 text-sm font-normal">/month</span>
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>{property.bedrooms || 0} beds</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{property.bathrooms || 0} baths</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3-3m0 0l3 3m-3-3v18M21 18l-3 3m0 0l-3-3m3 3V6" />
            </svg>
            <span>{property.size || 0} m²</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold mb-3 ${getStatusColor(property.status)}`}>
          {getStatusText(property.status)}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
          <Link
            to={`/landlord/edit-property/${property.id}`}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-center py-2 rounded-lg text-sm font-medium transition duration-200"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(property.id)}
            disabled={deleting === property.id}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-50"
          >
            {deleting === property.id ? '...' : 'Delete'}
          </button>
          <Link
            to={`/property/${property.id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm font-medium transition duration-200"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}