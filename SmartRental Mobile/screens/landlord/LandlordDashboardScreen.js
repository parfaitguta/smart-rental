// screens/landlord/LandlordDashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Logo from '../../components/Logo';

const API_URL = 'https://smart-rental-cqr0.onrender.com/api';

export default function LandlordDashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUser();
  };

  const menuItems = [
    { icon: '🏢', title: 'My Properties', desc: 'Manage your properties', route: 'LandlordProperties' },
    { icon: '👥', title: 'My Tenants', desc: 'Manage your tenants', route: 'LandlordTenants' },
    { icon: '📄', title: 'Rental Requests', desc: 'View pending requests', route: 'LandlordRequests' },
    { icon: '🏠', title: 'Rentals', desc: 'Active rental agreements', route: 'LandlordRentals' },
    { icon: '📊', title: 'Tenant Payments', desc: 'View tenant payment history', route: 'TenantMonthlyPayment' },
    { icon: '📝', title: 'Create Agreement', desc: 'Create rental agreement', route: 'CreateRentalAgreement' },
    { icon: '💬', title: 'Messages', desc: 'Chat with tenants', route: 'Messages' },
    { icon: '👤', title: 'My Profile', desc: 'Manage your account', route: 'Profile' },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Logo size="small" showText={false} />
          <View>
            <Text style={styles.welcome}>Welcome, {user?.full_name?.split(' ')[0] || 'Landlord'}!</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
        <Text style={styles.role}>Role: {user?.role}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              if (item.route === 'LandlordProperties') {
                navigation.navigate('LandlordProperties');
              } else if (item.route === 'LandlordTenants') {
                navigation.navigate('LandlordTenants');
              } else if (item.route === 'LandlordRequests') {
                navigation.navigate('LandlordRequests');
              } else if (item.route === 'LandlordRentals') {
                navigation.navigate('LandlordRentals');
              } else if (item.route === 'TenantMonthlyPayment') {
                navigation.navigate('TenantMonthlyPayment');
              } else if (item.route === 'CreateRentalAgreement') {
                navigation.navigate('CreateRentalAgreement');
              } else if (item.route === 'Messages') {
                navigation.navigate('Messages');
              } else if (item.route === 'Profile') {
                navigation.navigate('Profile');
              }
            }}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        navigation.replace('Login');
      }}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  email: {
    fontSize: 12,
    color: '#BFDBFE',
  },
  role: {
    fontSize: 12,
    color: '#BFDBFE',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  menu: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  menuDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    margin: 16,
    marginTop: 0,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});