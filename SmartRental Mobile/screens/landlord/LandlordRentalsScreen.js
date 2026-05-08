// screens/landlord/LandlordRentalsScreen.js
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

const API_URL = 'https://smart-rental-cqr0.onrender.com';

const formatCurrency = (amount) => {
  if (!amount) return 'RWF 0';
  return `RWF ${Number(amount).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

export default function LandlordRentalsScreen({ navigation }) {
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
      setRentals(response.data.rentals || []);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRentals();
  };

  const renderRental = ({ item }) => (
    <View style={styles.rentalCard}>
      <Text style={styles.propertyTitle}>{item.property_title}</Text>
      <Text style={styles.tenantName}>👤 {item.tenant_name}</Text>
      <Text style={styles.rentAmount}>💰 {formatCurrency(item.monthly_rent)}/month</Text>
      <Text style={styles.dateRange}>
        📅 {formatDate(item.start_date)} → {item.end_date ? formatDate(item.end_date) : 'Ongoing'}
      </Text>
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#10B98120' : '#EF444420' }]}>
        <Text style={[styles.statusText, { color: item.status === 'active' ? '#10B981' : '#EF4444' }]}>
          {item.status?.toUpperCase()}
        </Text>
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
        <Text style={styles.headerTitle}>Active Rentals</Text>
        <Text style={styles.headerCount}>{rentals.length} rental(s)</Text>
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
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  headerCount: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  listContent: { padding: 16 },
  rentalCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  propertyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  tenantName: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  rentAmount: { fontSize: 14, fontWeight: 'bold', color: '#2563EB', marginBottom: 4 },
  dateRange: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
});
