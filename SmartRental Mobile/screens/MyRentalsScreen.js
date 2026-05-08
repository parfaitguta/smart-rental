// screens/MyRentalsScreen.js - With Working Receipt AND Lease Download
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
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useLanguage } from '../context/LanguageContext';

const API_URL = 'https://smart-rental-cqr0.onrender.com';

const formatCurrency = (amount) => {
  if (!amount) return 'RWF 0';
  return `RWF ${Number(amount).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

export default function MyRentalsScreen({ navigation }) {
  const { t } = useLanguage();
  const [rentals, setRentals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const [rentalsRes, paymentsRes, requestsRes] = await Promise.all([
        axios.get(`${API_URL}/rentals/tenant`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/payments/tenant`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/payment-requests/tenant`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setRentals(rentalsRes.data.rentals || []);
      setPayments(paymentsRes.data.payments || []);
      setPaymentRequests(requestsRes.data.requests || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const url = `${API_URL}/receipts/${paymentId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }
      
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        const fileUri = FileSystem.documentDirectory + `receipt_${paymentId}.pdf`;
        
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Payment Receipt',
          });
        } else {
          Alert.alert(t('common.success'), t('success.receipt_saved'));
        }
      };
    } catch (error) {
      console.error('Error downloading receipt:', error);
      Alert.alert(t('common.error'), t('errors.receipt_download_failed'));
    }
  };

  const handleDownloadLease = async (rentalId, propertyTitle) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const url = `${API_URL}/lease/${rentalId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download lease');
      }
      
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        const fileUri = FileSystem.documentDirectory + `lease_${rentalId}.pdf`;
        
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: `Lease Agreement - ${propertyTitle}`,
          });
        } else {
          Alert.alert(t('common.success'), t('success.lease_saved'));
        }
      };
    } catch (error) {
      console.error('Error downloading lease:', error);
      Alert.alert(t('common.error'), t('errors.lease_download_failed'));
    }
  };

  // Direct message to landlord
  const messageLandlord = (landlordId, landlordName, propertyTitle) => {
    if (!landlordId) {
      Alert.alert(t('common.error'), t('errors.landlord_id_missing'));
      return;
    }
    navigation.navigate('Messages', {
      startChat: true,
      userId: landlordId,
      userName: landlordName,
      propertyTitle: propertyTitle,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'expired':
        return '#F59E0B';
      case 'terminated':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'overdue':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderRental = ({ item: rental }) => {
    const rentalPayments = payments.filter(p => p.rental_id === rental.id);
    const rentalRequests = paymentRequests.filter(pr => pr.rental_id === rental.id);
    
    const landlordId = rental.landlord_id;
    const landlordName = rental.landlord_name || 'Landlord';

    return (
      <View style={styles.rentalCard}>
        {/* Rental Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.propertyTitle}>{rental.property_title}</Text>
            <Text style={styles.propertyLocation}>
              📍 {rental.district}, {rental.province}
            </Text>
            <Text style={styles.landlordName}>{t('rentals.landlord')} {landlordName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(rental.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(rental.status) }]}>
              {rental.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={() => messageLandlord(landlordId, landlordName, rental.property_title)}
          >
            <Text style={styles.actionButtonText}>{t('rentals.message_landlord')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.leaseButton]}
            onPress={() => handleDownloadLease(rental.id, rental.property_title)}
          >
            <Text style={styles.actionButtonText}>{t('rentals.lease')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.calculatorButton]}
            onPress={() => navigation.navigate('MonthlyPayment', {
              rentalId: rental.id,
              propertyTitle: rental.property_title,
              monthlyRent: rental.monthly_rent,
            })}
          >
            <Text style={styles.actionButtonText}>{t('rentals.monthly_payment')}</Text>
          </TouchableOpacity>
        </View>

        {/* Rental Details */}
        <View style={styles.rentalDetails}>
          <Text style={styles.dateRange}>
            📅 {formatDate(rental.start_date)} {t('rentals.to')} {rental.end_date ? formatDate(rental.end_date) : t('rentals.ongoing')}
          </Text>
          <Text style={styles.rentAmount}>💰 {formatCurrency(rental.monthly_rent)}{t('home.price_per_month')}</Text>
        </View>

        {/* Payment Requests from Landlord */}
        {rentalRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('rentals.payment_requests')}</Text>
            {rentalRequests.map((pr) => (
              <View key={pr.id} style={styles.requestCard}>
                <View>
                  <Text style={styles.requestMonth}>{pr.month_year}</Text>
                  {pr.note && <Text style={styles.requestNote}>"{pr.note}"</Text>}
                  <Text style={styles.requestDue}>{t('rentals.due')} {formatDate(pr.due_date)}</Text>
                </View>
                <View style={styles.requestRight}>
                  <Text style={styles.requestAmount}>{formatCurrency(pr.amount)}</Text>
                  <Text style={[styles.requestStatus, { color: getPaymentStatusColor(pr.status) }]}>
                    {pr.status?.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Payment History with Receipt Button */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('rentals.payment_history')}</Text>
          {rentalPayments.length === 0 ? (
            <Text style={styles.noPayments}>{t('rentals.no_payments')}</Text>
          ) : (
            rentalPayments.map((pay) => (
              <View key={pay.id} style={styles.paymentRow}>
                <Text style={styles.paymentDate}>{formatDate(pay.payment_date)}</Text>
                <Text style={styles.paymentAmount}>{formatCurrency(pay.amount)}</Text>
                <Text style={styles.paymentMethod}>{pay.method?.replace('_', ' ')}</Text>
                <Text style={[styles.paymentStatus, { color: getPaymentStatusColor(pay.status) }]}>
                  {pay.status?.toUpperCase()}
                </Text>
                {pay.status === 'paid' && (
                  <TouchableOpacity onPress={() => handleDownloadReceipt(pay.id)}>
                    <Text style={styles.receiptButton}>{t('rentals.receipt')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('rentals.title')}</Text>
        <Text style={styles.headerCount}>{rentals.length} {t('rentals.agreements_count')}</Text>
      </View>

      <FlatList
        data={rentals}
        renderItem={renderRental}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('rentals.no_rentals')}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
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
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  rentalCard: {
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
    marginBottom: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  propertyLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  landlordName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  messageButton: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  leaseButton: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  calculatorButton: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  rentalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 12,
  },
  dateRange: {
    fontSize: 12,
    color: '#6B7280',
  },
  rentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  section: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  requestMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  requestNote: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  requestDue: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  requestRight: {
    alignItems: 'flex-end',
  },
  requestAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  requestStatus: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  noPayments: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
    flexWrap: 'wrap',
  },
  paymentDate: {
    fontSize: 11,
    color: '#6B7280',
    minWidth: 80,
  },
  paymentAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 70,
  },
  paymentMethod: {
    fontSize: 11,
    color: '#6B7280',
    minWidth: 80,
    textTransform: 'capitalize',
  },
  paymentStatus: {
    fontSize: 11,
    fontWeight: '500',
    minWidth: 50,
  },
  receiptButton: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
