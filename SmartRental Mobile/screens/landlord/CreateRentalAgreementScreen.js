// screens/landlord/CreateRentalAgreementScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.101:5000/api';

const formatCurrency = (amount) => {
  if (!amount) return 'RWF 0';
  return `RWF ${Number(amount).toLocaleString()}`;
};

export default function CreateRentalAgreementScreen({ route, navigation }) {
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Selector modals
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [showEndDateModal, setShowEndDateModal] = useState(false);
  
  // Form state
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Date states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1);
  const [startDay, setStartDay] = useState(new Date().getDate());
  
  const [endYear, setEndYear] = useState(new Date().getFullYear() + 1);
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endDay, setEndDay] = useState(new Date().getDate());
  
  const [monthlyRent, setMonthlyRent] = useState('');
  const [notes, setNotes] = useState('');

  // Get params from navigation (when coming from rental requests)
  useEffect(() => {
    const params = route.params || {};
    if (params.tenantId && params.tenantName) {
      setSelectedTenant({
        id: params.tenantId,
        full_name: params.tenantName,
      });
    }
    if (params.propertyId && params.propertyTitle) {
      setSelectedProperty({
        id: params.propertyId,
        title: params.propertyTitle,
        price: params.monthlyRent || 0,
      });
      setMonthlyRent(params.monthlyRent?.toString() || '');
    }
  }, [route.params]);

  // Generate arrays for pickers
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const [tenantsRes, propertiesRes] = await Promise.all([
        axios.get(`${API_URL}/tenants/landlord`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/properties/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTenants(tenantsRes.data.tenants || []);
      setProperties(propertiesRes.data.properties || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const selectTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowTenantModal(false);
  };

  const selectProperty = (property) => {
    setSelectedProperty(property);
    setMonthlyRent(property.price.toString());
    setShowPropertyModal(false);
  };

  const formatDateValue = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const formatDisplayDate = (year, month, day) => {
    return `${monthNames[month - 1]} ${day}, ${year}`;
  };

  const handleCreateAgreement = async () => {
    if (!selectedTenant) {
      Alert.alert('Error', 'Please select a tenant');
      return;
    }
    if (!selectedProperty) {
      Alert.alert('Error', 'Please select a property');
      return;
    }
    if (!monthlyRent || parseFloat(monthlyRent) <= 0) {
      Alert.alert('Error', 'Please enter a valid monthly rent');
      return;
    }

    setSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      
      const agreementData = {
        property_id: selectedProperty.id,
        tenant_id: selectedTenant.id,
        start_date: formatDateValue(startYear, startMonth, startDay),
        end_date: endDate ? formatDateValue(endYear, endMonth, endDay) : null,
        monthly_rent: parseFloat(monthlyRent),
        notes: notes,
      };
      
      await axios.post(`${API_URL}/rentals`, agreementData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      Alert.alert(
        'Success', 
        'Rental agreement created successfully!\n\nTenant has been activated.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Error creating agreement:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create rental agreement');
    } finally {
      setSubmitting(false);
    }
  };

  const DatePickerModal = ({ visible, onClose, onConfirm, title, year, month, day, setYear, setMonth, setDay }) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerModal}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          <View style={styles.datePickerRow}>
            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerLabel}>Year</Text>
              <ScrollView style={styles.datePickerScroll}>
                {years.map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.datePickerItem, year === y && styles.datePickerItemSelected]}
                    onPress={() => setYear(y)}
                  >
                    <Text style={[styles.datePickerItemText, year === y && styles.datePickerItemTextSelected]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerLabel}>Month</Text>
              <ScrollView style={styles.datePickerScroll}>
                {months.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.datePickerItem, month === m && styles.datePickerItemSelected]}
                    onPress={() => setMonth(m)}
                  >
                    <Text style={[styles.datePickerItemText, month === m && styles.datePickerItemTextSelected]}>
                      {monthNames[m - 1].substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerLabel}>Day</Text>
              <ScrollView style={styles.datePickerScroll}>
                {days.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.datePickerItem, day === d && styles.datePickerItemSelected]}
                    onPress={() => setDay(d)}
                  >
                    <Text style={[styles.datePickerItemText, day === d && styles.datePickerItemTextSelected]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          
          <View style={styles.datePickerButtons}>
            <TouchableOpacity style={styles.datePickerCancelButton} onPress={onClose}>
              <Text style={styles.datePickerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.datePickerConfirmButton} onPress={onConfirm}>
              <Text style={styles.datePickerConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Rental Agreement</Text>
        <Text style={styles.headerSubtitle}>Activate a new tenant on a property</Text>
      </View>

      <View style={styles.form}>
        {/* Select Tenant */}
        <TouchableOpacity 
          style={styles.selectorButton}
          onPress={() => setShowTenantModal(true)}
        >
          <Text style={styles.selectorLabel}>Select Tenant *</Text>
          <View style={styles.selectorValue}>
            <Text style={styles.selectorText}>
              {selectedTenant ? selectedTenant.full_name : 'Choose a tenant...'}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
        </TouchableOpacity>

        {selectedTenant && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>📧 {selectedTenant.email || 'N/A'}</Text>
            <Text style={styles.infoText}>📞 {selectedTenant.phone || 'N/A'}</Text>
          </View>
        )}

        {/* Select Property */}
        <TouchableOpacity 
          style={styles.selectorButton}
          onPress={() => setShowPropertyModal(true)}
        >
          <Text style={styles.selectorLabel}>Select Property *</Text>
          <View style={styles.selectorValue}>
            <Text style={styles.selectorText}>
              {selectedProperty ? selectedProperty.title : 'Choose a property...'}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
        </TouchableOpacity>

        {selectedProperty && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>📍 {selectedProperty.district || 'N/A'}, {selectedProperty.province || 'N/A'}</Text>
            <Text style={styles.infoText}>💰 Price: {formatCurrency(selectedProperty.price)}/month</Text>
          </View>
        )}

        {/* Start Date */}
        <TouchableOpacity 
          style={styles.selectorButton}
          onPress={() => setShowStartDateModal(true)}
        >
          <Text style={styles.selectorLabel}>Start Date *</Text>
          <View style={styles.selectorValue}>
            <Text style={styles.selectorText}>
              {formatDisplayDate(startYear, startMonth, startDay)}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </View>
        </TouchableOpacity>

        {/* End Date (Optional) */}
        <TouchableOpacity 
          style={styles.selectorButton}
          onPress={() => setShowEndDateModal(true)}
        >
          <Text style={styles.selectorLabel}>End Date (Optional)</Text>
          <View style={styles.selectorValue}>
            <Text style={styles.selectorText}>
              {endDate ? formatDisplayDate(endYear, endMonth, endDay) : 'No end date (ongoing)'}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </View>
        </TouchableOpacity>

        {/* Monthly Rent */}
        <TextInput
          style={styles.input}
          placeholder="Monthly Rent (RWF) *"
          value={monthlyRent}
          onChangeText={setMonthlyRent}
          keyboardType="numeric"
        />

        {/* Notes */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        {/* Create Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateAgreement}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.createButtonText}>Create Agreement & Activate Tenant</Text>
          )}
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>

      {/* Tenant Selection Modal */}
      <Modal
        visible={showTenantModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTenantModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Tenant</Text>
            <FlatList
              data={tenants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectTenant(item)}
                >
                  <Text style={styles.modalItemName}>{item.full_name}</Text>
                  <Text style={styles.modalItemEmail}>{item.email}</Text>
                  <Text style={styles.modalItemRent}>
                    Property: {item.property_title} - {formatCurrency(item.monthly_rent)}/month
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>No tenants found</Text>
              }
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTenantModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Property Selection Modal */}
      <Modal
        visible={showPropertyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPropertyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Property</Text>
            <FlatList
              data={properties.filter(p => p.status === 'available')}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectProperty(item)}
                >
                  <Text style={styles.modalItemName}>{item.title}</Text>
                  <Text style={styles.modalItemEmail}>
                    📍 {item.district}, {item.province}
                  </Text>
                  <Text style={styles.modalItemRent}>
                    💰 {formatCurrency(item.price)}/month
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>No available properties found</Text>
              }
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPropertyModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Start Date Picker Modal */}
      <DatePickerModal
        visible={showStartDateModal}
        onClose={() => setShowStartDateModal(false)}
        onConfirm={() => setShowStartDateModal(false)}
        title="Select Start Date"
        year={startYear}
        month={startMonth}
        day={startDay}
        setYear={setStartYear}
        setMonth={setStartMonth}
        setDay={setStartDay}
      />

      {/* End Date Picker Modal */}
      <DatePickerModal
        visible={showEndDateModal}
        onClose={() => setShowEndDateModal(false)}
        onConfirm={() => setShowEndDateModal(false)}
        title="Select End Date (Optional)"
        year={endYear}
        month={endMonth}
        day={endDay}
        setYear={setEndYear}
        setMonth={setEndMonth}
        setDay={setEndDay}
      />
    </ScrollView>
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
    backgroundColor: '#2563EB',
    padding: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginTop: 4,
  },
  form: {
    padding: 16,
  },
  selectorButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  selectorValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  calendarIcon: {
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalItemEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  modalItemRent: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 2,
  },
  modalEmpty: {
    textAlign: 'center',
    padding: 20,
    color: '#9CA3AF',
  },
  modalCloseButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontWeight: 'bold',
  },
  datePickerModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 250,
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  datePickerScroll: {
    flex: 1,
    width: '100%',
  },
  datePickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  datePickerItemSelected: {
    backgroundColor: '#2563EB',
  },
  datePickerItemText: {
    fontSize: 14,
    color: '#6B7280',
  },
  datePickerItemTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  datePickerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  datePickerCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  datePickerCancelText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  datePickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  datePickerConfirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
});