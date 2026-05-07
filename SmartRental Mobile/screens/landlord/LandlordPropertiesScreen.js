// screens/landlord/LandlordPropertiesScreen.js - FIXED with correct endpoint
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.101:5000/api';

const formatCurrency = (amount) => {
  if (!amount) return 'RWF 0';
  return `RWF ${Number(amount).toLocaleString()}`;
};

export default function LandlordPropertiesScreen({ navigation }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
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
    status: 'available',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  // CORRECT ENDPOINT: /api/properties/my
  const fetchProperties = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/properties/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      Alert.alert('Error', 'Failed to load properties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const openAddModal = () => {
    setEditingProperty(null);
    setForm({
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
      status: 'available',
    });
    setModalVisible(true);
  };

  const openEditModal = (property) => {
    setEditingProperty(property);
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
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.price || !form.province || !form.district) {
      Alert.alert('Error', 'Please fill all required fields');
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

      if (editingProperty) {
        await axios.put(`${API_URL}/properties/${editingProperty.id}`, propertyData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert('Success', 'Property updated successfully');
      } else {
        await axios.post(`${API_URL}/properties`, propertyData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert('Success', 'Property added successfully');
      }
      
      setModalVisible(false);
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (property) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${property.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('token');
              await axios.delete(`${API_URL}/properties/${property.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Success', 'Property deleted successfully');
              fetchProperties();
            } catch (error) {
              console.error('Error deleting property:', error);
              Alert.alert('Error', 'Failed to delete property');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'rented': return '#F59E0B';
      case 'inactive': return '#EF4444';
      default: return '#6B7280';
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

  const renderProperty = ({ item }) => (
    <View style={styles.propertyCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.propertyLocation}>📍 {item.district}, {item.province}</Text>
      <Text style={styles.propertyPrice}>💰 {formatCurrency(item.price)}/month</Text>
      
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>🛏️ {item.bedrooms || 0} beds</Text>
        <Text style={styles.detailText}>🛁 {item.bathrooms || 0} baths</Text>
        <Text style={styles.detailText}>📐 {item.size || 0} m²</Text>
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
          <Text style={styles.buttonText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
          <Text style={styles.buttonText}>🗑️ Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.viewButton} 
          onPress={() => navigation.navigate('PropertyDetail', { property: item })}
        >
          <Text style={styles.buttonText}>👁️ View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Properties</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add Property</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No properties yet</Text>
            <Text style={styles.emptySubtext}>Tap + Add Property to get started</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Add/Edit Property Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProperty ? 'Edit Property' : 'Add New Property'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Property Title *"
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder="Monthly Rent (RWF) *"
              value={form.price}
              onChangeText={(text) => setForm({ ...form, price: text })}
              keyboardType="numeric"
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Bedrooms"
                value={form.bedrooms}
                onChangeText={(text) => setForm({ ...form, bedrooms: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Bathrooms"
                value={form.bathrooms}
                onChangeText={(text) => setForm({ ...form, bathrooms: text })}
                keyboardType="numeric"
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Size (m²)"
              value={form.size}
              onChangeText={(text) => setForm({ ...form, size: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Province *"
              value={form.province}
              onChangeText={(text) => setForm({ ...form, province: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="District *"
              value={form.district}
              onChangeText={(text) => setForm({ ...form, district: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Sector"
              value={form.sector}
              onChangeText={(text) => setForm({ ...form, sector: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Address"
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
            />

            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={styles.statusOptions}>
                <TouchableOpacity
                  style={[styles.statusOption, form.status === 'available' && styles.statusOptionActive]}
                  onPress={() => setForm({ ...form, status: 'available' })}
                >
                  <Text style={[styles.statusOptionText, form.status === 'available' && styles.statusOptionTextActive]}>
                    Available
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusOption, form.status === 'rented' && styles.statusOptionActive]}
                  onPress={() => setForm({ ...form, status: 'rented' })}
                >
                  <Text style={[styles.statusOptionText, form.status === 'rented' && styles.statusOptionTextActive]}>
                    Rented
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusOption, form.status === 'inactive' && styles.statusOptionActive]}
                  onPress={() => setForm({ ...form, status: 'inactive' })}
                >
                  <Text style={[styles.statusOptionText, form.status === 'inactive' && styles.statusOptionTextActive]}>
                    Inactive
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveModalButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  propertyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
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
