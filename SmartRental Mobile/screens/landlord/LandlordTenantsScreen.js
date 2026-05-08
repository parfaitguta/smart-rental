// screens/landlord/LandlordTenantsScreen.js
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

export default function LandlordTenantsScreen({ navigation }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/tenants/landlord`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      Alert.alert('Error', 'Failed to load tenants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenants();
  };

  const renderTenant = ({ item }) => (
    <TouchableOpacity
      style={styles.tenantCard}
      onPress={() => navigation.navigate('TenantMonthlyPayment', {
        rentalId: item.rental_id,
        propertyTitle: item.property_title,
        monthlyRent: item.monthly_rent,
        tenantName: item.full_name,
      })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.tenantName}>{item.full_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.tenant_status === 'good' ? '#10B98120' : '#F59E0B20' }]}>
          <Text style={[styles.statusText, { color: item.tenant_status === 'good' ? '#10B981' : '#F59E0B' }]}>
            {item.tenant_status?.toUpperCase() || 'GOOD'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.propertyTitle}>🏠 {item.property_title}</Text>
      <Text style={styles.rentAmount}>💰 {formatCurrency(item.monthly_rent)}/month</Text>
      <Text style={styles.contactInfo}>📧 {item.email}</Text>
      <Text style={styles.contactInfo}>📞 {item.phone || 'N/A'}</Text>
      
      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => navigation.navigate('Messages', {
          startChat: true,
          userId: item.id,
          userName: item.full_name,
          propertyTitle: item.property_title,
        })}
      >
        <Text style={styles.messageButtonText}>💬 Message Tenant</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>My Tenants</Text>
        <Text style={styles.headerCount}>{tenants.length} tenant(s)</Text>
      </View>

      <FlatList
        data={tenants}
        renderItem={renderTenant}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tenants yet</Text>
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
  tenantCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tenantName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  propertyTitle: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  rentAmount: { fontSize: 16, fontWeight: 'bold', color: '#2563EB', marginBottom: 8 },
  contactInfo: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  messageButton: { backgroundColor: '#10B981', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  messageButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  emptyContainer: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
});
