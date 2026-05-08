import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://smart-rental-cqr0.onrender.com/api';

const formatCurrency = (amount) => {
  if (!amount) return 'RWF 0';
  return `RWF ${Number(amount).toLocaleString()}`;
};

const MONTHS = [
  { id: 0, name: 'Jan', fullName: 'January' },
  { id: 1, name: 'Feb', fullName: 'February' },
  { id: 2, name: 'Mar', fullName: 'March' },
  { id: 3, name: 'Apr', fullName: 'April' },
  { id: 4, name: 'May', fullName: 'May' },
  { id: 5, name: 'Jun', fullName: 'June' },
  { id: 6, name: 'Jul', fullName: 'July' },
  { id: 7, name: 'Aug', fullName: 'August' },
  { id: 8, name: 'Sep', fullName: 'September' },
  { id: 9, name: 'Oct', fullName: 'October' },
  { id: 10, name: 'Nov', fullName: 'November' },
  { id: 11, name: 'Dec', fullName: 'December' },
];

export default function LandlordTenantPaymentsScreen({ navigation }) {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tenantPayments, setTenantPayments] = useState({});

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchTenantPayments();
    }
  }, [selectedTenant, selectedYear]);

  const fetchTenants = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/tenants/landlord`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTenantPayments = async () => {
    if (!selectedTenant) return;
    
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/payments/tenant/${selectedTenant.id}?year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Process payments by month
      const paymentsByMonth = {};
      MONTHS.forEach(month => {
        paymentsByMonth[month.id] = {
          paid: 0,
          expected: selectedTenant.monthly_rent || 0,
          status: 'pending',
          paymentDate: null,
          remaining: selectedTenant.monthly_rent || 0,
        };
      });
      
      response.data.payments?.forEach(payment => {
        const date = new Date(payment.payment_date);
        const month = date.getMonth();
        const amount = parseFloat(payment.amount);
        
        paymentsByMonth[month].paid += amount;
        paymentsByMonth[month].remaining = Math.max(0, paymentsByMonth[month].expected - paymentsByMonth[month].paid);
        
        if (paymentsByMonth[month].paid >= paymentsByMonth[month].expected) {
          paymentsByMonth[month].status = 'paid';
          paymentsByMonth[month].paymentDate = payment.payment_date;
        } else if (paymentsByMonth[month].paid > 0) {
          paymentsByMonth[month].status = 'partial';
        } else {
          // Check if overdue (past the 5th of next month)
          const currentDate = new Date();
          const dueDate = new Date(date.getFullYear(), date.getMonth() + 1, 5);
          if (currentDate > dueDate && paymentsByMonth[month].paid === 0) {
            paymentsByMonth[month].status = 'overdue';
          }
        }
      });
      
      setTenantPayments(paymentsByMonth);
    } catch (error) {
      console.error('Error fetching tenant payments:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenants();
    if (selectedTenant) fetchTenantPayments();
  };

  const selectTenant = (tenant) => {
    setSelectedTenant(tenant);
    setModalVisible(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'partial': return '#F59E0B';
      case 'overdue': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'PAID';
      case 'partial': return 'PARTIAL';
      case 'overdue': return 'OVERDUE';
      default: return 'PENDING';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return '✅';
      case 'partial': return '⚠️';
      case 'overdue': return '❌';
      default: return '⏳';
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalExpected = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    let paidMonths = 0;
    let partialMonths = 0;
    let overdueMonths = 0;
    let pendingMonths = 0;
    
    MONTHS.forEach(month => {
      const payment = tenantPayments[month.id];
      if (payment) {
        totalExpected += payment.expected;
        totalPaid += payment.paid;
        totalRemaining += payment.remaining;
        
        switch (payment.status) {
          case 'paid': paidMonths++; break;
          case 'partial': partialMonths++; break;
          case 'overdue': overdueMonths++; break;
          default: pendingMonths++; break;
        }
      }
    });
    
    return { totalExpected, totalPaid, totalRemaining, paidMonths, partialMonths, overdueMonths, pendingMonths };
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const totals = selectedTenant ? calculateTotals() : null;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Tenant Selector */}
      <TouchableOpacity 
        style={styles.tenantSelector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.tenantSelectorLabel}>Select Tenant</Text>
        <View style={styles.tenantSelectorValue}>
          <Text style={styles.tenantSelectorText}>
            {selectedTenant ? selectedTenant.full_name : 'Choose a tenant...'}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </View>
      </TouchableOpacity>

      {selectedTenant && (
        <>
          {/* Tenant Info Card */}
          <View style={styles.tenantInfoCard}>
            <Text style={styles.tenantName}>{selectedTenant.full_name}</Text>
            <Text style={styles.tenantDetail}>📧 {selectedTenant.email}</Text>
            <Text style={styles.tenantDetail}>📞 {selectedTenant.phone || 'N/A'}</Text>
            <Text style={styles.tenantDetail}>🏠 Property: {selectedTenant.property_title}</Text>
            <Text style={styles.rentAmount}>💰 Monthly Rent: {formatCurrency(selectedTenant.monthly_rent)}</Text>
          </View>

          {/* Year Selector */}
          <View style={styles.yearSelector}>
            <TouchableOpacity 
              style={styles.yearButton}
              onPress={() => setSelectedYear(selectedYear - 1)}
            >
              <Text style={styles.yearButtonText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <TouchableOpacity 
              style={styles.yearButton}
              onPress={() => setSelectedYear(selectedYear + 1)}
            >
              <Text style={styles.yearButtonText}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{formatCurrency(totals?.totalExpected || 0)}</Text>
              <Text style={styles.summaryLabel}>Yearly Rent</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>{formatCurrency(totals?.totalPaid || 0)}</Text>
              <Text style={styles.summaryLabel}>Total Paid</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{formatCurrency(totals?.totalRemaining || 0)}</Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
            </View>
          </View>

          {/* Monthly Status Summary */}
          <View style={styles.statusSummary}>
            <Text style={styles.statusSummaryTitle}>📊 Payment Summary</Text>
            <View style={styles.statusSummaryGrid}>
              <View style={styles.statusSummaryItem}>
                <Text style={[styles.statusSummaryCount, { color: '#10B981' }]}>{totals?.paidMonths || 0}</Text>
                <Text style={styles.statusSummaryLabel}>Paid Months</Text>
              </View>
              <View style={styles.statusSummaryItem}>
                <Text style={[styles.statusSummaryCount, { color: '#F59E0B' }]}>{totals?.partialMonths || 0}</Text>
                <Text style={styles.statusSummaryLabel}>Partial</Text>
              </View>
              <View style={styles.statusSummaryItem}>
                <Text style={[styles.statusSummaryCount, { color: '#EF4444' }]}>{totals?.overdueMonths || 0}</Text>
                <Text style={styles.statusSummaryLabel}>Overdue</Text>
              </View>
              <View style={styles.statusSummaryItem}>
                <Text style={[styles.statusSummaryCount, { color: '#6B7280' }]}>{totals?.pendingMonths || 0}</Text>
                <Text style={styles.statusSummaryLabel}>Pending</Text>
              </View>
            </View>
          </View>

          {/* Monthly Payment Table */}
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>📅 Monthly Payment Details</Text>
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.monthCell]}>Month</Text>
              <Text style={[styles.tableCell, styles.rentCell]}>Rent</Text>
              <Text style={[styles.tableCell, styles.paidCell]}>Paid</Text>
              <Text style={[styles.tableCell, styles.remainingCell]}>Remaining</Text>
              <Text style={[styles.tableCell, styles.statusCell]}>Status</Text>
            </View>

            {/* Table Rows */}
            {MONTHS.map((month) => {
              const payment = tenantPayments[month.id];
              if (!payment) return null;
              
              return (
                <View key={month.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.monthCell, styles.monthName]}>
                    {month.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.rentCell]}>
                    {formatCurrency(payment.expected)}
                  </Text>
                  <Text style={[styles.tableCell, styles.paidCell, payment.paid > 0 && { color: '#10B981' }]}>
                    {formatCurrency(payment.paid)}
                  </Text>
                  <Text style={[styles.tableCell, styles.remainingCell, payment.remaining > 0 && { color: '#EF4444' }]}>
                    {formatCurrency(payment.remaining)}
                  </Text>
                  <View style={[styles.tableCell, styles.statusCell]}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                        {getStatusIcon(payment.status)} {getStatusText(payment.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Payment Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>💰 Annual Payment Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(totals?.totalPaid / totals?.totalExpected) * 100 || 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {((totals?.totalPaid / totals?.totalExpected) * 100 || 0).toFixed(1)}% Paid
            </Text>
          </View>
        </>
      )}

      {/* Tenant Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Tenant</Text>
            <FlatList
              data={tenants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.tenantItem}
                  onPress={() => selectTenant(item)}
                >
                  <Text style={styles.tenantItemName}>{item.full_name}</Text>
                  <Text style={styles.tenantItemProperty}>{item.property_title}</Text>
                  <Text style={styles.tenantItemRent}>{formatCurrency(item.monthly_rent)}/month</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No tenants found</Text>
                </View>
              }
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tenantSelector: {
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
  tenantSelectorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  tenantSelectorValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tenantSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  tenantInfoCard: {
    backgroundColor: '#2563EB',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  tenantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tenantDetail: {
    fontSize: 14,
    color: '#BFDBFE',
    marginBottom: 4,
  },
  rentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  yearButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'white',
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
    marginHorizontal: 24,
  },
  summaryContainer: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 0,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  statusSummary: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  statusSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statusSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusSummaryItem: {
    alignItems: 'center',
  },
  statusSummaryCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusSummaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  tableContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableCell: {
    fontSize: 12,
  },
  monthCell: {
    width: 50,
  },
  rentCell: {
    width: 70,
    textAlign: 'right',
  },
  paidCell: {
    width: 70,
    textAlign: 'right',
  },
  remainingCell: {
    width: 75,
    textAlign: 'right',
  },
  statusCell: {
    flex: 1,
    alignItems: 'flex-end',
  },
  monthName: {
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
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
  },
  tenantItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tenantItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tenantItemProperty: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  tenantItemRent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 2,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
