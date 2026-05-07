// screens/landlord/ManageRentalScreen.js - FIXED NAVIGATION
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
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.101:5000/api';

const formatCurrency = (amount) => {
  if (!amount) return 'RWF 0';
  return `RWF ${Number(amount).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

export default function ManageRentalScreen({ route, navigation }) {
  const { propertyId, propertyTitle } = route.params;
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/rentals/landlord`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const allRentals = response.data.rentals || [];
      // Filter rentals for this specific property
      const propertyRentals = allRentals.filter(r => r.property_title === propertyTitle);
      setRentals(propertyRentals);
      console.log('Found rentals:', propertyRentals.length);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      Alert.alert('Error', 'Failed to load rental information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRentals();
  };

  const handleTerminate = (rental) => {
    Alert.alert(
      'Terminate Tenancy',
      `Are you sure you want to terminate the tenancy for ${rental.tenant_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Terminate',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('token');
              await axios.put(
                `${API_URL}/rentals/${rental.id}/terminate`,
                { reason: 'Terminated by landlord' },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Alert.alert('Success', 'Tenancy terminated successfully');
              fetchRentals();
            } catch (error) {
              Alert.alert('Error', 'Failed to terminate tenancy');
            }
          },
        },
      ]
    );
  };

  const handleSendReminder = (rental) => {
    Alert.alert(
      'Send Reminder',
      `Send payment reminder to ${rental.tenant_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('token');
              await axios.post(
                `${API_URL}/messages`,
                {
                  receiver_id: rental.tenant_id,
                  message: `Friendly reminder: Your rent payment for ${rental.property_title} is due.`,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Alert.alert('Success', 'Reminder sent to tenant');
            } catch (error) {
              Alert.alert('Error', 'Failed to send reminder');
            }
          },
        },
      ]
    );
  };

  const viewPaymentHistory = (rental) => {
    console.log('Navigating with rental:', rental.id, rental.property_title, rental.monthly_rent, rental.tenant_name);
    navigation.navigate('TenantMonthlyPayment', {
      rentalId: rental.id,
      propertyTitle: rental.property_title,
      monthlyRent: rental.monthly_rent,
      tenantName: rental.tenant_name,
    });
  };

  const renderRental = ({ item }) => (
    <View style={styles.rentalCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.tenantName}>{item.tenant_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#10B98120' : '#EF444420' }]}>
          <Text style={[styles.statusText, { color: item.status === 'active' ? '#10B981' : '#EF4444' }]}>
            {item.status?.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.tenantContact}>📧 {item.tenant_email || 'N/A'}</Text>
      <Text style={styles.tenantContact}>📞 {item.tenant_phone || 'N/A'}</Text>
      <Text style={styles.dateRange}>
        📅 {formatDate(item.start_date)} → {item.end_date ? formatDate(item.end_date) : 'Ongoing'}
      </Text>
      <Text style={styles.rentAmount}>💰 {formatCurrency(item.monthly_rent)}/month</Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.reminderButton} 
          onPress={() => handleSendReminder(item)}
        >
          <Text style={styles.buttonText}>🔔 Reminder</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.paymentButton} 
          onPress={() => viewPaymentHistory(item)}
        >
          <Text style={styles.buttonText}>💰 Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.terminateButton} 
          onPress={() => handleTerminate(item)}
        >
          <Text style={styles.buttonText}>🚫 Terminate</Text>
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
        <Text style={styles.headerTitle}>Manage Rental</Text>
        <Text style={styles.propertyTitle}>{propertyTitle}</Text>
        <Text style={styles.headerCount}>{rentals.length} active tenant(s)</Text>
      </View>

      <FlatList
        data={rentals}
        renderItem={renderRental}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active rentals</Text>
            <Text style={styles.emptySubtext}>This property is not currently rented</Text>
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
  propertyTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  tenantName: {
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
  tenantContact: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  rentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  reminderButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  terminateButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
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
});
