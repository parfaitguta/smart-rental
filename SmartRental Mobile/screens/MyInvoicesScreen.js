// screens/MyInvoicesScreen.js - With Cancel Invoice Button
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.101:5000/api';

// Month names for selector
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Auto-generate due date (TODAY'S DATE)
const generateDueDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function MyInvoicesScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [rentals, setRentals] = useState([]);
  
  // Rental selector states
  const [showRentalSelector, setShowRentalSelector] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  
  // Month selector states
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [form, setForm] = useState({
    rental_id: '',
    amount: '',
    month_year: '',
    due_date: generateDueDate(),
    notes: '',
  });
  const [payForm, setPayForm] = useState({
    amount: '',
    phone: '',
    method: 'mtn_momo',
  });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    fetchInvoices();
    fetchRentals();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/invoices/tenant`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRentals = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/rentals/tenant`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals(response.data.rentals || []);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    }
  };

  // Select rental from dropdown
  const selectRental = (rental) => {
    setSelectedRental(rental);
    setForm({
      ...form,
      rental_id: rental.id.toString(),
      amount: rental.monthly_rent.toString(),
      due_date: generateDueDate(),
    });
    setShowRentalSelector(false);
  };

  // Update month_year when month or year changes
  const updateMonthYear = (monthIndex, year) => {
    const monthName = MONTHS[monthIndex];
    const monthYear = `${monthName} ${year}`;
    setForm({ ...form, month_year: monthYear });
    setSelectedMonthIndex(monthIndex);
    setSelectedYear(year);
  };

  const selectMonth = (monthIndex) => {
    updateMonthYear(monthIndex, selectedYear);
    setShowMonthSelector(false);
  };

  const changeYear = (delta) => {
    const newYear = selectedYear + delta;
    setSelectedYear(newYear);
    updateMonthYear(selectedMonthIndex, newYear);
  };

  const onCreateInvoice = async () => {
    if (!form.rental_id || !form.amount || !form.month_year) {
      Alert.alert('Error', 'Please select rental and month');
      return;
    }

    setSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.post(`${API_URL}/invoices`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Invoice created successfully!');
      setShowCreateModal(false);
      setForm({ 
        rental_id: '', 
        amount: '', 
        month_year: '', 
        due_date: generateDueDate(), 
        notes: '' 
      });
      setSelectedRental(null);
      fetchInvoices();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const onPayInvoice = async () => {
    if (!payForm.amount || !payForm.phone) {
      Alert.alert('Error', 'Please enter amount and phone number');
      return;
    }

    setSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.post(
        `${API_URL}/invoices/${selectedInvoice.id}/pay`,
        payForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Payment initiated! Check your phone to confirm.');
      setShowPayModal(false);
      setPayForm({ amount: '', phone: '', method: 'mtn_momo' });
      fetchInvoices();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  // NEW: Cancel Invoice Function
  const handleCancelInvoice = (invoice) => {
    Alert.alert(
      'Cancel Invoice',
      `Are you sure you want to cancel the invoice for ${invoice.month_year}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              const token = await SecureStore.getItemAsync('token');
              await axios.put(`${API_URL}/invoices/${invoice.id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Success', 'Invoice cancelled successfully');
              fetchInvoices();
            } catch (error) {
              console.error('Error cancelling invoice:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel invoice');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'partial': return '#F59E0B';
      case 'overdue': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Updated renderInvoice with Cancel Button
  const renderInvoice = ({ item }) => {
    const isCancelled = item.status === 'cancelled';
    const canCancel = !isCancelled && item.status !== 'paid' && (item.status === 'unpaid' || item.status === 'partial');
    const canPay = !isCancelled && item.status !== 'paid' && parseFloat(item.remaining) > 0;

    return (
      <View style={styles.invoiceCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.monthYear}>{item.month_year}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.propertyTitle}>{item.property_title}</Text>
        <Text style={styles.landlordName}>👤 Landlord: {item.landlord_name}</Text>

        <View style={styles.amountContainer}>
          <Text style={styles.totalAmount}>Total: RWF {parseFloat(item.amount).toLocaleString()}</Text>
          <Text style={styles.paidAmount}>Paid: RWF {parseFloat(item.amount_paid).toLocaleString()}</Text>
          {parseFloat(item.remaining) > 0 && !isCancelled && (
            <Text style={styles.remainingAmount}>Remaining: RWF {parseFloat(item.remaining).toLocaleString()}</Text>
          )}
        </View>

        <Text style={styles.dueDate}>Due: {formatDate(item.due_date)}</Text>

        {!isCancelled && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(item.amount_paid / item.amount) * 100}%` },
              ]}
            />
          </View>
        )}

        <View style={styles.actionButtonsRow}>
          {canPay && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => {
                setSelectedInvoice(item);
                setPayForm({ amount: item.remaining, phone: '', method: 'mtn_momo' });
                setShowPayModal(true);
              }}
            >
              <Text style={styles.payButtonText}>Pay RWF {parseFloat(item.remaining).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
          
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelInvoice(item)}
            >
              <Text style={styles.cancelButtonText}>❌ Cancel Invoice</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Invoices</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ New Invoice</Text>
        </TouchableOpacity>
      </View>

      {/* Invoices List */}
      <FlatList
        data={invoices}
        renderItem={renderInvoice}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No invoices found</Text>
            <Text style={styles.emptySubtext}>Create your first invoice</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Create Invoice Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Invoice</Text>

            {/* Rental Selector Button */}
            <TouchableOpacity 
              style={styles.selectorButton}
              onPress={() => setShowRentalSelector(true)}
            >
              <Text style={styles.selectorLabel}>Select Rental Property *</Text>
              <View style={styles.selectorValue}>
                <Text style={styles.selectorText}>
                  {selectedRental ? selectedRental.property_title : 'Choose a property...'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </View>
            </TouchableOpacity>

            {/* Amount (auto-filled from selected rental) */}
            <TextInput
              style={styles.input}
              placeholder="Amount (RWF)"
              value={form.amount}
              onChangeText={(text) => setForm({ ...form, amount: text })}
              keyboardType="numeric"
              editable={!!selectedRental}
            />

            {/* Month Selector Button */}
            <TouchableOpacity 
              style={styles.selectorButton}
              onPress={() => setShowMonthSelector(true)}
            >
              <Text style={styles.selectorLabel}>Select Month *</Text>
              <View style={styles.selectorValue}>
                <Text style={styles.selectorText}>
                  {form.month_year || 'Choose a month...'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </View>
            </TouchableOpacity>

            {/* Due Date - Auto-generated, display only */}
            <View style={styles.readonlyField}>
              <Text style={styles.readonlyLabel}>Due Date (Auto - Today's Date)</Text>
              <Text style={styles.readonlyValue}>{formatDate(form.due_date)}</Text>
            </View>

            {/* Notes Input (Optional) */}
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes (optional)"
              value={form.notes}
              onChangeText={(text) => setForm({ ...form, notes: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setSelectedRental(null);
                  setForm({ 
                    rental_id: '', 
                    amount: '', 
                    month_year: '', 
                    due_date: generateDueDate(), 
                    notes: '' 
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={onCreateInvoice}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rental Selector Modal */}
      <Modal visible={showRentalSelector} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.selectorModal}>
            <Text style={styles.modalTitle}>Select Rental Property</Text>
            
            {rentals.length === 0 ? (
              <View style={styles.emptyRentals}>
                <Text style={styles.emptyText}>No active rentals found</Text>
                <Text style={styles.emptySubtext}>You need an active rental to create an invoice</Text>
              </View>
            ) : (
              rentals.map((rental) => (
                <TouchableOpacity
                  key={rental.id}
                  style={styles.rentalItem}
                  onPress={() => selectRental(rental)}
                >
                  <Text style={styles.rentalTitle}>{rental.property_title}</Text>
                  <Text style={styles.rentalLocation}>📍 {rental.district}, {rental.province}</Text>
                  <Text style={styles.rentalRent}>💰 Monthly Rent: RWF {parseFloat(rental.monthly_rent).toLocaleString()}</Text>
                </TouchableOpacity>
              ))
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRentalSelector(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Month Selector Modal */}
      <Modal visible={showMonthSelector} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.selectorModal}>
            <Text style={styles.modalTitle}>Select Month</Text>
            
            {/* Year Selector */}
            <View style={styles.yearSelector}>
              <TouchableOpacity 
                style={styles.yearButton}
                onPress={() => changeYear(-1)}
              >
                <Text style={styles.yearButtonText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.yearText}>{selectedYear}</Text>
              <TouchableOpacity 
                style={styles.yearButton}
                onPress={() => changeYear(1)}
              >
                <Text style={styles.yearButtonText}>▶</Text>
              </TouchableOpacity>
            </View>

            {/* Month Grid */}
            <View style={styles.monthGrid}>
              {MONTHS.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.monthItem,
                    selectedMonthIndex === index && styles.monthItemSelected,
                  ]}
                  onPress={() => selectMonth(index)}
                >
                  <Text style={[
                    styles.monthItemText,
                    selectedMonthIndex === index && styles.monthItemTextSelected,
                  ]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMonthSelector(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pay Invoice Modal */}
      <Modal visible={showPayModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pay Invoice</Text>
            <Text style={styles.modalSubtitle}>
              Invoice: {selectedInvoice?.month_year} - RWF {parseFloat(selectedInvoice?.remaining || 0).toLocaleString()} remaining
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Amount to Pay"
              value={payForm.amount}
              onChangeText={(text) => setPayForm({ ...payForm, amount: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number (07XXXXXXXX)"
              value={payForm.phone}
              onChangeText={(text) => setPayForm({ ...payForm, phone: text })}
              keyboardType="phone-pad"
            />

            <View style={styles.methodContainer}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  payForm.method === 'mtn_momo' && styles.methodActive,
                ]}
                onPress={() => setPayForm({ ...payForm, method: 'mtn_momo' })}
              >
                <Text style={styles.methodText}>MTN MoMo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  payForm.method === 'airtel_money' && styles.methodActive,
                ]}
                onPress={() => setPayForm({ ...payForm, method: 'airtel_money' })}
              >
                <Text style={styles.methodText}>Airtel Money</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPayModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.payModalButton]}
                onPress={onPayInvoice}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Pay Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
  createButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  invoiceCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
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
  propertyTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  landlordName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  amountContainer: {
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 14,
    color: '#1F2937',
  },
  paidAmount: {
    fontSize: 14,
    color: '#10B981',
  },
  remainingAmount: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  dueDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  payButton: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  payButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectorButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  selectorValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 14,
    color: '#1F2937',
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectorModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
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
  readonlyField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  readonlyLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  readonlyValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  rentalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rentalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  rentalLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  rentalRent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 4,
  },
  emptyRentals: {
    padding: 20,
    alignItems: 'center',
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  yearButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  yearButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  yearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 20,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthItem: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthItemSelected: {
    backgroundColor: '#2563EB',
  },
  monthItemText: {
    fontSize: 14,
    color: '#6B7280',
  },
  monthItemTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  methodContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  methodActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  methodText: {
    color: '#1F2937',
    fontWeight: '500',
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
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2563EB',
  },
  payModalButton: {
    backgroundColor: '#10B981',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});