// screens/landlord/LandlordRequestsScreen.js - WITH CREATE AGREEMENT BUTTON
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

const API_URL = 'https://smart-rental-cqr0.onrender.com/api';

export default function LandlordRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/requests/landlord`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleAccept = async (requestId, propertyId, tenantId, propertyTitle, tenantName) => {
    Alert.alert(
      'Accept Request',
      `Accept rental request from ${tenantName} for ${propertyTitle}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setProcessing(true);
            try {
              const token = await SecureStore.getItemAsync('token');
              await axios.put(
                `${API_URL}/requests/${requestId}/accept`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Alert.alert('Success', 'Request accepted! You can now create a rental agreement.');
              fetchRequests(); // Refresh the list
            } catch (error) {
              console.error('Error accepting request:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to accept request');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = async (requestId, tenantName, propertyTitle) => {
    Alert.alert(
      'Reject Request',
      `Reject rental request from ${tenantName} for ${propertyTitle}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessing(true);
            try {
              const token = await SecureStore.getItemAsync('token');
              await axios.put(
                `${API_URL}/requests/${requestId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Alert.alert('Success', 'Request rejected');
              fetchRequests(); // Refresh the list
            } catch (error) {
              console.error('Error rejecting request:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to reject request');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleCreateAgreement = (tenantId, tenantName, propertyId, propertyTitle, monthlyRent) => {
    // Navigate to Create Rental Agreement with pre-filled data
    navigation.navigate('CreateRentalAgreement', {
      tenantId: tenantId,
      tenantName: tenantName,
      propertyId: propertyId,
      propertyTitle: propertyTitle,
      monthlyRent: monthlyRent,
    });
  };

  const renderRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.tenantName}>{item.renter_name || item.tenant_name || 'Tenant'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'pending' ? '#F59E0B20' : item.status === 'accepted' ? '#10B98120' : '#EF444420' }]}>
          <Text style={[styles.statusText, { color: item.status === 'pending' ? '#F59E0B' : item.status === 'accepted' ? '#10B981' : '#EF4444' }]}>
            {item.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.propertyTitle}>🏠 {item.property_title}</Text>
      <Text style={styles.requestMessage}>📝 {item.message || 'No message provided'}</Text>
      <Text style={styles.contactInfo}>📧 {item.renter_email || item.email || 'N/A'}</Text>
      <Text style={styles.contactInfo}>📞 {item.renter_phone || item.phone || 'N/A'}</Text>
      <Text style={styles.requestDate}>📅 {new Date(item.created_at).toLocaleDateString()}</Text>

      {item.status === 'pending' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.acceptButton} 
            onPress={() => handleAccept(item.id, item.property_id, item.renter_id, item.property_title, item.renter_name)}
            disabled={processing}
          >
            <Text style={styles.buttonText}>✓ Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rejectButton} 
            onPress={() => handleReject(item.id, item.renter_name, item.property_title)}
            disabled={processing}
          >
            <Text style={styles.buttonText}>✗ Reject</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {item.status === 'accepted' && (
        <View>
          <View style={styles.acceptedMessage}>
            <Text style={styles.acceptedText}>✓ Request Accepted</Text>
          </View>
          <TouchableOpacity 
            style={styles.createAgreementButton}
            onPress={() => handleCreateAgreement(
              item.renter_id, 
              item.renter_name, 
              item.property_id, 
              item.property_title,
              item.monthly_rent || 0
            )}
          >
            <Text style={styles.createAgreementButtonText}>📝 Create Rental Agreement</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {item.status === 'rejected' && (
        <View style={styles.rejectedMessage}>
          <Text style={styles.rejectedText}>✗ Request Rejected</Text>
        </View>
      )}
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
        <Text style={styles.headerTitle}>Rental Requests</Text>
        <Text style={styles.headerCount}>{requests.length} request(s)</Text>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rental requests</Text>
            <Text style={styles.emptySubtext}>When tenants request to rent, they'll appear here</Text>
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
  requestCard: {
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
  propertyTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  requestMessage: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  acceptedMessage: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptedText: {
    color: '#059669',
    fontWeight: '600',
  },
  rejectedMessage: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectedText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  createAgreementButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  createAgreementButtonText: {
    color: 'white',
    fontWeight: '600',
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
    textAlign: 'center',
  },
});