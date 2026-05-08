// screens/landlord/TenantMonthlyPaymentScreen.js - WITH TENANT SELECTOR
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
  FlatList,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://smart-rental-cqr0.onrender.com/api';

const formatCurrency = (amount) => {
  if (!amount) return 'RWF 0';
  return `RWF ${Number(amount).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

export default function TenantMonthlyPaymentScreen({ route, navigation }) {
  // Get params from navigation
  const params = route.params || {};
  const directRentalId = params.rentalId;
  const directPropertyTitle = params.propertyTitle;
  const directMonthlyRent = params.monthlyRent;
  const directTenantName = params.tenantName;

  // State for tenant selector
  const [tenants, setTenants] = useState([]);
  const [showTenantSelector, setShowTenantSelector] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [error, setError] = useState(null);
  const [tenantInfo, setTenantInfo] = useState({
    name: directTenantName || 'Tenant',
    property: directPropertyTitle || 'Property',
    rent: directMonthlyRent || 0,
    rentalId: directRentalId,
  });

  // If no rentalId is passed, fetch tenants and show selector
  useEffect(() => {
    if (directRentalId) {
      fetchMonthlyBreakdown(directRentalId);
    } else {
      fetchTenants();
    }
  }, [directRentalId]);

  const fetchTenants = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/tenants/landlord`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(response.data.tenants || []);
      setLoading(false);
      
      // If there's only one tenant, select it automatically
      if (response.data.tenants?.length === 1) {
        selectTenant(response.data.tenants[0]);
      } else if (response.data.tenants?.length > 1) {
        setShowTenantSelector(true);
      } else {
        Alert.alert('Info', 'No tenants found');
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      Alert.alert('Error', 'Failed to load tenants');
      setLoading(false);
    }
  };

  const selectTenant = (tenant) => {
    setSelectedTenant(tenant);
    setTenantInfo({
      name: tenant.full_name,
      property: tenant.property_title,
      rent: tenant.monthly_rent,
      rentalId: tenant.rental_id,
    });
    setShowTenantSelector(false);
    fetchMonthlyBreakdown(tenant.rental_id);
  };

  const fetchMonthlyBreakdown = async (rentalId) => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/rentals/${rentalId}/monthly-breakdown`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMonths(response.data.monthly_breakdown || []);
      if (response.data.monthly_breakdown?.length > 0) {
        const currentMonth = response.data.monthly_breakdown.find(m => {
          const now = new Date();
          return m.year === now.getFullYear() && m.month === now.getMonth() + 1;
        }) || response.data.monthly_breakdown[0];
        setSelectedMonth(currentMonth.month_year);
        setMonthData(currentMonth);
      }
    } catch (error) {
      console.error('Error fetching monthly breakdown:', error);
      setError(error.response?.data?.message || error.message);
      Alert.alert('Error', 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (monthYear) => {
    setSelectedMonth(monthYear);
    const data = months.find(m => m.month_year === monthYear);
    setMonthData(data);
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: { bg: '#10B98120', color: '#10B981', text: 'PAID' },
      partial: { bg: '#F59E0B20', color: '#F59E0B', text: 'PARTIAL' },
      unpaid: { bg: '#EF444420', color: '#EF4444', text: 'UNPAID' },
    };
    const current = styles[status] || styles.unpaid;
    return (
      <View style={[stylesLocal.statusBadge, { backgroundColor: current.bg }]}>
        <Text style={[stylesLocal.statusText, { color: current.color }]}>{current.text}</Text>
      </View>
    );
  };

  if (loading && !selectedTenant && directRentalId) {
    return (
      <View style={stylesLocal.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={stylesLocal.center}>
        <Text style={stylesLocal.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={stylesLocal.retryButton}
          onPress={() => fetchMonthlyBreakdown(tenantInfo.rentalId)}
        >
          <Text style={stylesLocal.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentYear = new Date().getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const allMonths = monthNames.map((name, index) => ({
    month_year: `${currentYear}-${String(index + 1).padStart(2, '0')}`,
    month_name: `${name} ${currentYear}`,
  }));

  const monthsWithData = allMonths.map(month => {
    const existing = months.find(m => m.month_year === month.month_year);
    return existing || {
      ...month,
      monthly_rent: tenantInfo.rent,
      paid_amount: 0,
      remaining_amount: tenantInfo.rent,
      status: 'unpaid',
      payment_percentage: 0,
      payments: [],
    };
  });

  return (
    <ScrollView style={stylesLocal.container}>
      {/* Tenant Selector Button - Only show if no tenant pre-selected */}
      {!directRentalId && (
        <TouchableOpacity
          style={stylesLocal.tenantSelector}
          onPress={() => setShowTenantSelector(true)}
        >
          <Text style={stylesLocal.tenantSelectorLabel}>Select Tenant</Text>
          <View style={stylesLocal.tenantSelectorValue}>
            <Text style={stylesLocal.tenantSelectorText}>
              {selectedTenant ? selectedTenant.full_name : 'Choose a tenant...'}
            </Text>
            <Text style={stylesLocal.dropdownIcon}>▼</Text>
          </View>
        </TouchableOpacity>
      )}

      {tenantInfo.rentalId && (
        <>
          <View style={stylesLocal.header}>
            <Text style={stylesLocal.headerTitle}>Monthly Payment Status</Text>
            <Text style={stylesLocal.tenantName}>{tenantInfo.name}</Text>
            <Text style={stylesLocal.propertyTitle}>{tenantInfo.property}</Text>
            <Text style={stylesLocal.monthlyRent}>Monthly Rent: {formatCurrency(tenantInfo.rent)}</Text>
          </View>

          <View style={stylesLocal.selectorCard}>
            <Text style={stylesLocal.selectorLabel}>Select Month</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={stylesLocal.monthScroll}>
              {monthsWithData.map((month) => (
                <TouchableOpacity
                  key={month.month_year}
                  style={[
                    stylesLocal.monthButton,
                    selectedMonth === month.month_year && stylesLocal.monthButtonActive,
                    month.status === 'paid' && stylesLocal.monthButtonPaid,
                  ]}
                  onPress={() => handleMonthChange(month.month_year)}
                >
                  <Text style={[
                    stylesLocal.monthButtonText,
                    selectedMonth === month.month_year && stylesLocal.monthButtonTextActive,
                  ]}>
                    {month.month_name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {monthData && (
            <View style={stylesLocal.detailsCard}>
              <View style={stylesLocal.detailsHeader}>
                <Text style={stylesLocal.detailsMonth}>{monthData.month_name}</Text>
                {getStatusBadge(monthData.status)}
              </View>

              <View style={stylesLocal.amountGrid}>
                <View style={stylesLocal.amountCard}>
                  <Text style={stylesLocal.amountLabel}>Rent Amount</Text>
                  <Text style={stylesLocal.amountValue}>{formatCurrency(monthData.monthly_rent)}</Text>
                </View>
                <View style={[stylesLocal.amountCard, stylesLocal.paidCard]}>
                  <Text style={stylesLocal.amountLabel}>Paid</Text>
                  <Text style={[stylesLocal.amountValue, stylesLocal.paidValue]}>{formatCurrency(monthData.paid_amount)}</Text>
                </View>
                <View style={[stylesLocal.amountCard, stylesLocal.remainingCard]}>
                  <Text style={stylesLocal.amountLabel}>Remaining</Text>
                  <Text style={[stylesLocal.amountValue, stylesLocal.remainingValue]}>{formatCurrency(monthData.remaining_amount)}</Text>
                </View>
              </View>

              <View style={stylesLocal.progressSection}>
                <View style={stylesLocal.progressHeader}>
                  <Text style={stylesLocal.progressLabel}>Payment Progress</Text>
                  <Text style={stylesLocal.progressPercent}>{Math.round(monthData.payment_percentage)}%</Text>
                </View>
                <View style={stylesLocal.progressBar}>
                  <View style={[stylesLocal.progressFill, { width: `${Math.min(monthData.payment_percentage, 100)}%` }]} />
                </View>
              </View>

              {monthData.payments.length > 0 && (
                <View style={stylesLocal.transactionsSection}>
                  <Text style={stylesLocal.transactionsTitle}>Payment Transactions</Text>
                  {monthData.payments.map((payment, idx) => (
                    <View key={idx} style={stylesLocal.transactionItem}>
                      <View>
                        <Text style={stylesLocal.transactionAmount}>{formatCurrency(payment.amount)}</Text>
                        <Text style={stylesLocal.transactionDate}>{formatDate(payment.date)}</Text>
                      </View>
                      <View style={stylesLocal.transactionStatus}>
                        <Text style={stylesLocal.transactionStatusText}>✓ Paid</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {monthData.payments.length === 0 && monthData.status === 'unpaid' && (
                <View style={stylesLocal.noPaymentsCard}>
                  <Text style={stylesLocal.noPaymentsText}>No payments recorded for this month</Text>
                  <Text style={stylesLocal.noPaymentsSubtext}>Tenant hasn't made a payment yet</Text>
                </View>
              )}
            </View>
          )}

          <View style={stylesLocal.summaryCard}>
            <Text style={stylesLocal.summaryTitle}>Year Summary</Text>
            <View style={stylesLocal.summaryGrid}>
              <View style={stylesLocal.summaryItem}>
                <Text style={stylesLocal.summaryValue}>{monthsWithData.length}</Text>
                <Text style={stylesLocal.summaryLabel}>Total Months</Text>
              </View>
              <View style={stylesLocal.summaryItem}>
                <Text style={[stylesLocal.summaryValue, stylesLocal.paidValue]}>
                  {monthsWithData.filter(m => m.status === 'paid').length}
                </Text>
                <Text style={stylesLocal.summaryLabel}>Paid</Text>
              </View>
              <View style={stylesLocal.summaryItem}>
                <Text style={[stylesLocal.summaryValue, stylesLocal.warningValue]}>
                  {monthsWithData.filter(m => m.status === 'partial').length}
                </Text>
                <Text style={stylesLocal.summaryLabel}>Partial</Text>
              </View>
              <View style={stylesLocal.summaryItem}>
                <Text style={[stylesLocal.summaryValue, stylesLocal.remainingValue]}>
                  {monthsWithData.filter(m => m.status === 'unpaid').length}
                </Text>
                <Text style={stylesLocal.summaryLabel}>Unpaid</Text>
              </View>
            </View>
          </View>

          <View style={stylesLocal.totalCard}>
            <Text style={stylesLocal.totalTitle}>💰 Total Summary for {currentYear}</Text>
            <View style={stylesLocal.totalGrid}>
              <View style={stylesLocal.totalItem}>
                <Text style={stylesLocal.totalLabel}>Yearly Rent</Text>
                <Text style={stylesLocal.totalValue}>{formatCurrency(tenantInfo.rent * 12)}</Text>
              </View>
              <View style={stylesLocal.totalItem}>
                <Text style={stylesLocal.totalLabel}>Total Paid</Text>
                <Text style={[stylesLocal.totalValue, stylesLocal.paidValue]}>
                  {formatCurrency(monthsWithData.reduce((sum, m) => sum + m.paid_amount, 0))}
                </Text>
              </View>
              <View style={stylesLocal.totalItem}>
                <Text style={stylesLocal.totalLabel}>Total Remaining</Text>
                <Text style={[stylesLocal.totalValue, stylesLocal.remainingValue]}>
                  {formatCurrency(monthsWithData.reduce((sum, m) => sum + m.remaining_amount, 0))}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Tenant Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTenantSelector}
        onRequestClose={() => setShowTenantSelector(false)}
      >
        <View style={stylesLocal.modalOverlay}>
          <View style={stylesLocal.modalContent}>
            <Text style={stylesLocal.modalTitle}>Select a Tenant</Text>
            <FlatList
              data={tenants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={stylesLocal.tenantItem}
                  onPress={() => selectTenant(item)}
                >
                  <Text style={stylesLocal.tenantItemName}>{item.full_name}</Text>
                  <Text style={stylesLocal.tenantItemProperty}>{item.property_title}</Text>
                  <Text style={stylesLocal.tenantItemRent}>{formatCurrency(item.monthly_rent)}/month</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={stylesLocal.emptyContainer}>
                  <Text style={stylesLocal.emptyText}>No tenants found</Text>
                </View>
              }
            />
            <TouchableOpacity
              style={stylesLocal.closeButton}
              onPress={() => setShowTenantSelector(false)}
            >
              <Text style={stylesLocal.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const stylesLocal = StyleSheet.create({
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
    marginBottom: 0,
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
  tenantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginBottom: 4,
  },
  monthlyRent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FEF08A',
    marginTop: 8,
  },
  selectorCard: {
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
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  monthScroll: {
    flexDirection: 'row',
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  monthButtonActive: {
    backgroundColor: '#2563EB',
  },
  monthButtonPaid: {
    backgroundColor: '#10B981',
  },
  monthButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  monthButtonTextActive: {
    color: 'white',
    fontWeight: '600',
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
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
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
  warningValue: {
    color: '#F59E0B',
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
    backgroundColor: '#2563EB',
    borderRadius: 4,
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
    marginBottom: 4,
  },
  noPaymentsSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
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
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
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
  totalCard: {
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
  totalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  totalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
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
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});