// screens/MonthlyPaymentScreen.js - WITH MONTH SELECTOR DROPDOWN
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://smart-rental-cqr0.onrender.com';

const formatCurrency = (amount) => {
  if (!amount) return 'RWF 0';
  return `RWF ${Number(amount).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

export default function MonthlyPaymentScreen({ route, navigation }) {
  const { rentalId, propertyTitle, monthlyRent } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  const [error, setError] = useState(null);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  
  // Payment modal states
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mtn_momo');
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (rentalId) {
      fetchMonthlyBreakdown();
    } else {
      Alert.alert('Error', 'No rental information found');
      setLoading(false);
    }
  }, [rentalId]);

  const fetchMonthlyBreakdown = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/rentals/${rentalId}/monthly-breakdown`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const monthsList = response.data.monthly_breakdown || [];
      setMonths(monthsList);
      
      if (monthsList.length > 0) {
        // Default select current month or first unpaid month
        const now = new Date();
        const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        let defaultMonth = monthsList.find(m => m.month_year === currentMonthYear);
        
        if (!defaultMonth || defaultMonth.status === 'paid') {
          defaultMonth = monthsList.find(m => m.status !== 'paid') || monthsList[0];
        }
        
        setSelectedMonth(defaultMonth.month_year);
        setSelectedMonthData(defaultMonth);
      }
    } catch (error) {
      console.error('Error fetching monthly breakdown:', error);
      setError(error.response?.data?.message || error.message);
      Alert.alert('Error', 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthSelect = (monthYear) => {
    setSelectedMonth(monthYear);
    const data = months.find(m => m.month_year === monthYear);
    setSelectedMonthData(data);
    setShowMonthSelector(false);
  };

  const getSelectedMonthName = () => {
    if (!selectedMonthData) return 'Select Month';
    return selectedMonthData.month_name;
  };

  // Create or get invoice for the selected month
  const getOrCreateInvoice = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      
      // First check if invoice exists
      const checkResponse = await axios.get(`${API_URL}/invoices/rental/${rentalId}/current-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (checkResponse.data.has_invoice && checkResponse.data.month_year === selectedMonthData.month_year) {
        setCurrentInvoiceId(checkResponse.data.invoice_id);
        return checkResponse.data.invoice_id;
      }
      
      // Create new invoice
      const dueDate = new Date();
      dueDate.setDate(10);
      
      const createResponse = await axios.post(`${API_URL}/invoices`, {
        rental_id: rentalId,
        amount: selectedMonthData.remaining_amount,
        month_year: selectedMonthData.month_year,
        due_date: dueDate.toISOString().split('T')[0],
        notes: `Rent payment for ${selectedMonthData.month_name}`
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCurrentInvoiceId(createResponse.data.invoice.id);
      return createResponse.data.invoice.id;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  };

  // Handle Pay button click
  const handlePayNow = async () => {
    if (!selectedMonthData) {
      Alert.alert('Error', 'Please select a month first');
      return;
    }

    if (selectedMonthData.status === 'paid') {
      Alert.alert('Info', 'This month is already paid');
      return;
    }

    if (selectedMonthData.remaining_amount <= 0) {
      Alert.alert('Info', 'No amount remaining to pay');
      return;
    }

    // Open payment modal
    setPhoneNumber('');
    setPaymentMethod('mtn_momo');
    setPaymentModalVisible(true);
  };

  // Process payment with PayPack
  const processPayPackPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    
    // Validate Rwanda phone number
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!cleanPhone.match(/^07[2389]\d{7}$/)) {
      Alert.alert('Error', 'Please enter a valid Rwanda phone number (e.g., 078XXXXXXX)');
      return;
    }
    
    try {
      setPaying(true);
      
      // First get or create invoice
      const invoiceId = await getOrCreateInvoice();
      
      const token = await SecureStore.getItemAsync('token');
      
      const paymentData = {
        amount: selectedMonthData.remaining_amount,
        phone: phoneNumber,
        method: paymentMethod
      };
      
      const response = await axios.post(`${API_URL}/invoices/${invoiceId}/pay`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPaymentModalVisible(false);
      
      Alert.alert(
        'Payment Initiated',
        `${response.data.message}\n\nAmount: ${formatCurrency(selectedMonthData.remaining_amount)}\nPhone: ${phoneNumber}\n\nPlease check your phone to confirm the payment.`,
        [
          { text: 'OK', onPress: () => verifyPaymentStatus(response.data.payment_id) }
        ]
      );
      
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  // Verify payment status
  const verifyPaymentStatus = async (paymentId) => {
    setVerifying(true);
    
    const checkStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const response = await axios.post(`${API_URL}/invoices/verify`, 
          { payment_id: paymentId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.status === 'successful') {
          Alert.alert('Success!', 'Your payment has been confirmed!');
          fetchMonthlyBreakdown(); // Refresh the data
          return true;
        } else if (response.data.status === 'failed') {
          Alert.alert('Failed', 'Payment failed. Please try again.');
          return true;
        } else {
          Alert.alert(
            'Payment Pending',
            'Your payment is still being processed. Would you like to check again?',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Check Again', onPress: () => checkStatus() }
            ]
          );
          return false;
        }
      } catch (error) {
        console.error('Verification error:', error);
        Alert.alert('Error', 'Could not verify payment status. Please check later.');
        return true;
      }
    };
    
    await checkStatus();
    setVerifying(false);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return '✅';
      case 'partial': return '⚠️';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return '#10B981';
      case 'partial': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case 'paid': return '#D1FAE5';
      case 'partial': return '#FEF3C7';
      default: return '#FEE2E2';
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchMonthlyBreakdown();
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (months.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No months found for this rental</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monthly Payment</Text>
        <Text style={styles.propertyTitle}>{propertyTitle || 'Property'}</Text>
        <Text style={styles.monthlyRent}>Monthly Rent: {formatCurrency(monthlyRent || 0)}</Text>
      </View>

      {/* Month Selector Button */}
      <TouchableOpacity 
        style={styles.monthSelectorButton}
        onPress={() => setShowMonthSelector(true)}
      >
        <Text style={styles.monthSelectorLabel}>Select Month</Text>
        <View style={styles.monthSelectorValue}>
          <Text style={styles.monthSelectorText}>{getSelectedMonthName()}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </View>
      </TouchableOpacity>

      {/* Month Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMonthSelector}
        onRequestClose={() => setShowMonthSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <FlatList
              data={months}
              keyExtractor={(item) => item.month_year}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.monthOption,
                    selectedMonth === item.month_year && styles.monthOptionSelected,
                    item.status === 'paid' && styles.monthOptionPaid,
                  ]}
                  onPress={() => handleMonthSelect(item.month_year)}
                >
                  <Text style={[
                    styles.monthOptionText,
                    selectedMonth === item.month_year && styles.monthOptionTextSelected,
                  ]}>
                    {item.month_name}
                  </Text>
                  {item.status === 'paid' && (
                    <Text style={styles.monthOptionStatus}>✅ Paid</Text>
                  )}
                  {item.status === 'partial' && (
                    <Text style={styles.monthOptionStatusPartial}>⚠️ Partial</Text>
                  )}
                  {item.status === 'unpaid' && (
                    <Text style={styles.monthOptionStatusUnpaid}>⏳ Unpaid</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMonthSelector(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {selectedMonthData && (
        <View style={styles.detailsCard}>
          <View style={styles.monthTitleContainer}>
            <Text style={styles.detailsMonth}>{selectedMonthData.month_name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(selectedMonthData.status) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(selectedMonthData.status) }]}>
                {getStatusIcon(selectedMonthData.status)} {selectedMonthData.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.amountGrid}>
            <View style={[styles.amountCard, styles.rentCard]}>
              <Text style={styles.amountLabel}>Monthly Rent</Text>
              <Text style={styles.amountValue}>{formatCurrency(selectedMonthData.monthly_rent)}</Text>
            </View>
            <View style={[styles.amountCard, styles.paidCard]}>
              <Text style={styles.amountLabel}>Paid Amount</Text>
              <Text style={[styles.amountValue, styles.paidValue]}>{formatCurrency(selectedMonthData.paid_amount)}</Text>
            </View>
            <View style={[styles.amountCard, styles.remainingCard]}>
              <Text style={styles.amountLabel}>Remaining</Text>
              <Text style={[styles.amountValue, styles.remainingValue]}>{formatCurrency(selectedMonthData.remaining_amount)}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Payment Progress</Text>
              <Text style={styles.progressPercent}>{Math.round(selectedMonthData.payment_percentage)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(selectedMonthData.payment_percentage, 100)}%`,
                    backgroundColor: selectedMonthData.status === 'paid' ? '#10B981' : selectedMonthData.status === 'partial' ? '#F59E0B' : '#EF4444'
                  }
                ]} 
              />
            </View>
          </View>

          {/* PAY BUTTON - Only show if not fully paid */}
          {selectedMonthData.status !== 'paid' && selectedMonthData.remaining_amount > 0 && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayNow}
              disabled={paying}
            >
              {paying ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.payButtonText}>
                  Pay {formatCurrency(selectedMonthData.remaining_amount)}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {selectedMonthData.status === 'paid' && (
            <View style={styles.paidMessage}>
              <Text style={styles.paidMessageText}>✅ This month is fully paid</Text>
            </View>
          )}

          {selectedMonthData.payments.length > 0 && (
            <View style={styles.transactionsSection}>
              <Text style={styles.transactionsTitle}>Payment Transactions</Text>
              {selectedMonthData.payments.map((payment, idx) => (
                <View key={idx} style={styles.transactionItem}>
                  <View>
                    <Text style={styles.transactionAmount}>{formatCurrency(payment.amount)}</Text>
                    <Text style={styles.transactionDate}>{formatDate(payment.date)}</Text>
                  </View>
                  <View style={styles.transactionStatus}>
                    <Text style={styles.transactionStatusText}>✓ Paid</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Summary for All Months */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>All Months Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{months.length}</Text>
            <Text style={styles.summaryLabel}>Total Months</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.paidValue]}>
              {months.filter(m => m.status === 'paid').length}
            </Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
              {months.filter(m => m.status === 'partial').length}
            </Text>
            <Text style={styles.summaryLabel}>Partial</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.remainingValue]}>
              {months.filter(m => m.status === 'unpaid').length}
            </Text>
            <Text style={styles.summaryLabel}>Unpaid</Text>
          </View>
        </View>
      </View>

      {/* Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModalContent}>
            <Text style={styles.paymentModalTitle}>Pay via Mobile Money</Text>
            
            <Text style={styles.paymentModalLabel}>Amount to Pay</Text>
            <Text style={styles.paymentModalAmount}>
              {formatCurrency(selectedMonthData?.remaining_amount || 0)}
            </Text>
            
            <Text style={styles.paymentModalLabel}>Select Payment Method</Text>
            <View style={styles.methodContainer}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  paymentMethod === 'mtn_momo' && styles.methodButtonActive
                ]}
                onPress={() => setPaymentMethod('mtn_momo')}
              >
                <Text style={[
                  styles.methodButtonText,
                  paymentMethod === 'mtn_momo' && styles.methodButtonTextActive
                ]}>MTN MoMo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  paymentMethod === 'airtel_money' && styles.methodButtonActive
                ]}
                onPress={() => setPaymentMethod('airtel_money')}
              >
                <Text style={[
                  styles.methodButtonText,
                  paymentMethod === 'airtel_money' && styles.methodButtonTextActive
                ]}>Airtel Money</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.paymentModalLabel}>Phone Number</Text>
            <TextInput
              style={styles.paymentModalInput}
              placeholder="078XXXXXXX"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <Text style={styles.paymentModalHint}>Enter phone number starting with 078, 072, 079, etc.</Text>
            
            <TouchableOpacity
              style={styles.paymentModalPayButton}
              onPress={processPayPackPayment}
              disabled={paying}
            >
              {paying ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.paymentModalPayButtonText}>
                  Pay {formatCurrency(selectedMonthData?.remaining_amount || 0)}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.paymentModalCancelButton}
              onPress={() => setPaymentModalVisible(false)}
            >
              <Text style={styles.paymentModalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Verification overlay */}
      {verifying && (
        <View style={styles.verifyingOverlay}>
          <View style={styles.verifyingCard}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.verifyingText}>Verifying payment...</Text>
            <Text style={styles.verifyingSubtext}>Please check your phone</Text>
          </View>
        </View>
      )}
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
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 16,
    color: '#BFDBFE',
    marginBottom: 4,
  },
  monthlyRent: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  // Month Selector Button
  monthSelectorButton: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  monthSelectorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  monthSelectorValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Month Selector Modal
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
  monthOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  monthOptionPaid: {
    backgroundColor: '#ECFDF5',
  },
  monthOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  monthOptionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  monthOptionStatus: {
    fontSize: 12,
    color: '#10B981',
  },
  monthOptionStatusPartial: {
    fontSize: 12,
    color: '#F59E0B',
  },
  monthOptionStatusUnpaid: {
    fontSize: 12,
    color: '#EF4444',
  },
  closeButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  detailsCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  monthTitleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsMonth: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  amountCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rentCard: {
    backgroundColor: '#EFF6FF',
  },
  paidCard: {
    backgroundColor: '#ECFDF5',
  },
  remainingCard: {
    backgroundColor: '#FEF2F2',
  },
  amountLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  paidValue: {
    color: '#10B981',
  },
  remainingValue: {
    color: '#EF4444',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  payButton: {
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  payButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  paidMessage: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  paidMessageText: {
    color: '#10B981',
    fontWeight: '600',
  },
  transactionsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  transactionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  transactionStatus: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  transactionStatusText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  noPaymentsCard: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  noPaymentsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Payment Modal styles
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
  },
  paymentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  paymentModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  paymentModalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 20,
    textAlign: 'center',
  },
  methodContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: '#2563EB',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  methodButtonTextActive: {
    color: 'white',
  },
  paymentModalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  paymentModalHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  paymentModalPayButton: {
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentModalPayButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  paymentModalCancelButton: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentModalCancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  verifyingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  verifyingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  verifyingSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
});
