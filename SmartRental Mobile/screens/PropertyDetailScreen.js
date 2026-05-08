// screens/PropertyDetailScreen.js - Complete with Edit, Manage Rental, AND Get Directions
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useLanguage } from '../context/LanguageContext';

const API_URL = 'https://smart-rental-cqr0.onrender.com';

const formatCurrency = (amount) => {
  if (!amount) return 'RWF 0';
  return `RWF ${Number(amount).toLocaleString()}`;
};

// Function to open Google Maps with coordinates
const openGoogleMaps = (latitude, longitude, address, t) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const encodedAddress = encodeURIComponent(address);
  
  let url;
  
  if (Platform.OS === 'ios') {
    // iOS - try Apple Maps first
    url = `maps://maps.apple.com/?q=${lat},${lng}&q=${encodedAddress}`;
  } else if (Platform.OS === 'android') {
    // Android - Google Maps
    url = `geo:${lat},${lng}?q=${lat},${lng}(${encodedAddress})`;
  } else {
    // Web fallback
    url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  
  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to browser
        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(fallbackUrl);
      }
    })
    .catch(err => {
      Alert.alert(t('common.error'), t('property.map_open_error'));
    });
};

export default function PropertyDetailScreen({ route, navigation }) {
  const { t } = useLanguage();
  const { property } = route.params;
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    size: '',
    province: '',
    district: '',
    sector: '',
    address: '',
    status: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsOwner(parsedUser.id === property.landlord_id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = () => {
    setForm({
      title: property.title,
      description: property.description || '',
      price: property.price.toString(),
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      size: property.size?.toString() || '',
      province: property.province || '',
      district: property.district || '',
      sector: property.sector || '',
      address: property.address || '',
      status: property.status || 'available',
    });
    setEditModalVisible(true);
  };

  const handleUpdateProperty = async () => {
    if (!form.title || !form.price || !form.province || !form.district) {
      Alert.alert(t('common.error'), t('property.fill_required_fields'));
      return;
    }

    setSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      const propertyData = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        bedrooms: parseInt(form.bedrooms) || 0,
        bathrooms: parseInt(form.bathrooms) || 0,
        size: parseFloat(form.size) || 0,
        province: form.province,
        district: form.district,
        sector: form.sector,
        address: form.address,
        status: form.status,
      };

      await axios.put(`${API_URL}/properties/${property.id}`, propertyData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      Alert.alert(t('common.success'), t('property.update_success'));
      setEditModalVisible(false);
      
      // Update the property in the navigation params
      const updatedProperty = { ...property, ...propertyData };
      navigation.setParams({ property: updatedProperty });
      
    } catch (error) {
      console.error('Error updating property:', error);
      Alert.alert(t('common.error'), error.response?.data?.message || t('property.update_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestRental = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.post(
        `${API_URL}/requests`,
        {
          property_id: property.id,
          message: `I am interested in renting ${property.title}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert(t('common.success'), t('property.request_sent'));
    } catch (error) {
      Alert.alert(t('common.error'), t('property.request_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCallLandlord = () => {
    if (property.landlord_phone) {
      Linking.openURL(`tel:${property.landlord_phone}`);
    } else {
      Alert.alert(t('common.info'), t('property.landlord_phone_unavailable'));
    }
  };

  const handleMessageLandlord = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    
    if (!property.landlord_id) {
      Alert.alert(t('common.error'), t('property.message_error'));
      return;
    }
    
    navigation.navigate('Messages', {
      startChat: true,
      userId: property.landlord_id,
      userName: property.landlord_name || 'Landlord',
      propertyTitle: property.title,
    });
  };

  const handleManageRental = () => {
    navigation.navigate('ManageRental', {
      propertyId: property.id,
      propertyTitle: property.title,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'rented': return '#F59E0B';
      case 'inactive': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Get coordinates (use defaults if not available)
  const getLatitude = () => {
    return property.latitude || -1.9441; // Default Kigali
  };
  
  const getLongitude = () => {
    return property.longitude || 30.0619; // Default Kigali
  };

  // Get address for directions
  const getPropertyAddress = () => {
    return `${property.district || ''}, ${property.province || ''}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Property Images */}
      <Image
        source={{
          uri: property.images?.[0] || 'https://placehold.co/400x300/png?text=No+Image',
        }}
        style={styles.mainImage}
      />

      {/* Property Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.location}>📍 {property.district}, {property.province}</Text>
        <Text style={styles.price}>RWF {property.price?.toLocaleString()}/month</Text>

        {/* GET DIRECTIONS BUTTON - Added here */}
        <TouchableOpacity 
          style={styles.directionsButton}
          onPress={() => openGoogleMaps(
            getLatitude(),
            getLongitude(),
            getPropertyAddress(),
            t
          )}
        >
          <Text style={styles.directionsButtonText}>🗺️ {t('property.directions')}</Text>
        </TouchableOpacity>

        {/* Status Badge for Owner */}
        {isOwner && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(property.status) + '20', alignSelf: 'flex-start', marginBottom: 12 }]}>
            <Text style={[styles.statusText, { color: getStatusColor(property.status) }]}>
              {t('common.status')}: {property.status ? t(`common.${property.status}`)?.toUpperCase() : t('common.available').toUpperCase()}
            </Text>
          </View>
        )}

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('common.bedrooms')}</Text>
            <Text style={styles.detailValue}>{property.bedrooms || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('common.bathrooms')}</Text>
            <Text style={styles.detailValue}>{property.bathrooms || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('common.size')}</Text>
            <Text style={styles.detailValue}>{property.size || 'N/A'} m²</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('common.status')}</Text>
            <Text style={[styles.detailValue, styles.statusText]}>
              {property.status ? t(`common.${property.status}`) : t('common.available')}
            </Text>
          </View>
        </View>

        {/* Description */}
        {property.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.description')}</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
        )}

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.amenities')}</Text>
            <View style={styles.amenitiesList}>
              {property.amenities.map((item, index) => (
                <View key={index} style={styles.amenityBadge}>
                  <Text style={styles.amenityText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Landlord Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isOwner ? t('property.property_owner') : t('property.landlord')}
          </Text>
          <View style={styles.landlordCard}>
            <View>
              <Text style={styles.landlordName}>
                {isOwner ? t('property.you') : (property.landlord_name || t('property.property_owner'))}
              </Text>
              {!isOwner && property.landlord_email && (
                <Text style={styles.landlordEmail}>{property.landlord_email}</Text>
              )}
            </View>
            <View style={styles.landlordButtons}>
              {!isOwner && property.landlord_phone && (
                <TouchableOpacity style={styles.callButton} onPress={handleCallLandlord}>
                  <Text style={styles.callButtonText}>📞 {t('property.call_landlord')}</Text>
                </TouchableOpacity>
              )}
              {!isOwner && (
                <TouchableOpacity style={styles.messageButton} onPress={handleMessageLandlord}>
                  <Text style={styles.messageButtonText}>💬 {t('property.message_landlord')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {isOwner ? (
        <View style={styles.ownerButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={openEditModal}
          >
            <Text style={styles.actionButtonText}>✏️ {t('property.edit_property')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.manageButton]}
            onPress={handleManageRental}
          >
            <Text style={styles.actionButtonText}>🏠 {t('property.manage_rental')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleRequestRental}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.requestButtonText}>{t('property.request_rental')}</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Edit Property Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('property.edit_property')}</Text>

            <TextInput
              style={styles.input}
              placeholder={t('property.placeholder_title')}
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('property.placeholder_description')}
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder={t('property.placeholder_rent')}
              value={form.price}
              onChangeText={(text) => setForm({ ...form, price: text })}
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder={t('common.bedrooms')}
                value={form.bedrooms}
                onChangeText={(text) => setForm({ ...form, bedrooms: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder={t('common.bathrooms')}
                value={form.bathrooms}
                onChangeText={(text) => setForm({ ...form, bathrooms: text })}
                keyboardType="numeric"
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder={t('common.size')}
              value={form.size}
              onChangeText={(text) => setForm({ ...form, size: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder={t('property.placeholder_province')}
              value={form.province}
              onChangeText={(text) => setForm({ ...form, province: text })}
            />

            <TextInput
              style={styles.input}
              placeholder={t('property.placeholder_district')}
              value={form.district}
              onChangeText={(text) => setForm({ ...form, district: text })}
            />

            <TextInput
              style={styles.input}
              placeholder={t('property.placeholder_sector')}
              value={form.sector}
              onChangeText={(text) => setForm({ ...form, sector: text })}
            />

            <TextInput
              style={styles.input}
              placeholder={t('property.placeholder_address')}
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
            />

            {/* Add Latitude and Longitude fields for landlords */}
            <TextInput
              style={styles.input}
              placeholder={t('property.placeholder_latitude')}
              value={form.latitude}
              onChangeText={(text) => setForm({ ...form, latitude: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder={t('property.placeholder_longitude')}
              value={form.longitude}
              onChangeText={(text) => setForm({ ...form, longitude: text })}
              keyboardType="numeric"
            />

            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>{t('common.status')}:</Text>
              <View style={styles.statusOptions}>
                <TouchableOpacity
                  style={[styles.statusOption, form.status === 'available' && styles.statusOptionActive]}
                  onPress={() => setForm({ ...form, status: 'available' })}
                >
                  <Text style={[styles.statusOptionText, form.status === 'available' && styles.statusOptionTextActive]}>
                    {t('common.available')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusOption, form.status === 'rented' && styles.statusOptionActive]}
                  onPress={() => setForm({ ...form, status: 'rented' })}
                >
                  <Text style={[styles.statusOptionText, form.status === 'rented' && styles.statusOptionTextActive]}>
                    {t('common.rented')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusOption, form.status === 'inactive' && styles.statusOptionActive]}
                  onPress={() => setForm({ ...form, status: 'inactive' })}
                >
                  <Text style={[styles.statusOptionText, form.status === 'inactive' && styles.statusOptionTextActive]}>
                    {t('common.inactive')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleUpdateProperty}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveModalButtonText}>{t('common.update')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mainImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E5E7EB',
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 16,
  },
  directionsButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  directionsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  detailItem: {
    width: '50%',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 12,
    color: '#2563EB',
  },
  landlordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  landlordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  landlordEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  landlordButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  messageButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  messageButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  requestButton: {
    backgroundColor: '#2563EB',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ownerButtons: {
    flexDirection: 'row',
    gap: 12,
    margin: 16,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#F59E0B',
  },
  manageButton: {
    backgroundColor: '#2563EB',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  statusOptionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusOptionTextActive: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelModalButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  saveModalButton: {
    backgroundColor: '#2563EB',
  },
  saveModalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});