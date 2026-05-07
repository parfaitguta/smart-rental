// screens/admin/AdminReportsScreen.js - Simplified
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.101:5000/api';

const formatCurrency = (amount) => {
  if (!amount) return 'RWF 0';
  return `RWF ${Number(amount).toLocaleString()}`;
};

export default function AdminReportsScreen() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportType, setReportType] = useState('monthly');

  useEffect(() => {
    fetchReport();
  }, [selectedYear, reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/admin/reports?type=${reportType}&year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      Alert.alert('Error', 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const years = [2023, 2024, 2025, 2026, 2027];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSubtitle}>View platform reports</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Report Type</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[styles.typeButton, reportType === 'monthly' && styles.typeButtonActive]}
              onPress={() => setReportType('monthly')}
            >
              <Text style={[styles.typeButtonText, reportType === 'monthly' && styles.typeButtonTextActive]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, reportType === 'yearly' && styles.typeButtonActive]}
              onPress={() => setReportType('yearly')}
            >
              <Text style={[styles.typeButtonText, reportType === 'yearly' && styles.typeButtonTextActive]}>
                Yearly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, reportType === 'property' && styles.typeButtonActive]}
              onPress={() => setReportType('property')}
            >
              <Text style={[styles.typeButtonText, reportType === 'property' && styles.typeButtonTextActive]}>
                Property
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Select Year</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
            <View style={styles.yearButtons}>
              {years.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[styles.yearButton, selectedYear === year && styles.yearButtonActive]}
                  onPress={() => setSelectedYear(year)}
                >
                  <Text style={[styles.yearButtonText, selectedYear === year && styles.yearButtonTextActive]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Summary Cards */}
      {reportData && (
        <>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{reportData.total_properties || 0}</Text>
              <Text style={styles.summaryLabel}>Total Properties</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{formatCurrency(reportData.total_revenue || 0)}</Text>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{reportData.total_rentals || 0}</Text>
              <Text style={styles.summaryLabel}>Active Rentals</Text>
            </View>
          </View>

          {/* Monthly Breakdown */}
          {reportType === 'monthly' && reportData.monthly_data && (
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>Monthly Breakdown for {selectedYear}</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.monthCell]}>Month</Text>
                <Text style={[styles.tableCell, styles.revenueCell]}>Revenue</Text>
                <Text style={[styles.tableCell, styles.countCell]}>Payments</Text>
              </View>
              {reportData.monthly_data.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.monthCell]}>{item.month}</Text>
                  <Text style={[styles.tableCell, styles.revenueCell]}>{formatCurrency(item.revenue)}</Text>
                  <Text style={[styles.tableCell, styles.countCell]}>{item.payment_count}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Yearly Breakdown */}
          {reportType === 'yearly' && reportData.yearly_data && (
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>Yearly Breakdown</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.yearCell]}>Year</Text>
                <Text style={[styles.tableCell, styles.revenueCell]}>Revenue</Text>
                <Text style={[styles.tableCell, styles.countCell]}>Payments</Text>
              </View>
              {reportData.yearly_data.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.yearCell]}>{item.year}</Text>
                  <Text style={[styles.tableCell, styles.revenueCell]}>{formatCurrency(item.revenue)}</Text>
                  <Text style={[styles.tableCell, styles.countCell]}>{item.payment_count}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Top Properties */}
          {reportType === 'property' && reportData.property_data && (
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>Property Performance</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.propertyCell]}>Property</Text>
                <Text style={[styles.tableCell, styles.revenueCell]}>Revenue</Text>
                <Text style={[styles.tableCell, styles.rentalsCell]}>Rentals</Text>
              </View>
              {reportData.property_data.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.propertyCell]}>{item.title}</Text>
                  <Text style={[styles.tableCell, styles.revenueCell]}>{formatCurrency(item.total_revenue)}</Text>
                  <Text style={[styles.tableCell, styles.rentalsCell]}>{item.rental_count}</Text>
                </View>
              ))}
            </View>
          )}
        </>
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
    backgroundColor: '#7C3AED',
    padding: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#C4B5FD',
    marginTop: 4,
  },
  controls: {
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
  controlGroup: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#7C3AED',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  yearScroll: {
    flexDirection: 'row',
  },
  yearButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  yearButtonActive: {
    backgroundColor: '#7C3AED',
  },
  yearButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  yearButtonTextActive: {
    color: 'white',
    fontWeight: '600',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  tableContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
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
    flex: 2,
  },
  yearCell: {
    flex: 1,
  },
  revenueCell: {
    flex: 2,
    textAlign: 'right',
  },
  countCell: {
    flex: 1,
    textAlign: 'right',
  },
  propertyCell: {
    flex: 3,
  },
  rentalsCell: {
    flex: 1,
    textAlign: 'right',
  },
});