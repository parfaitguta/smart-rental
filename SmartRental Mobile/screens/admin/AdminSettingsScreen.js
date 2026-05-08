// screens/admin/AdminSettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://smart-rental-cqr0.onrender.com';

export default function AdminSettingsScreen() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    require_approval: true,
    max_rental_days: 365,
    default_rental_fee: 0,
    notification_email: '',
    admin_email: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use default settings if API not ready
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.put(`${API_URL}/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>System Settings</Text>
        <Text style={styles.headerSubtitle}>Configure platform settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Maintenance Mode</Text>
            <Text style={styles.settingDescription}>Put the platform in maintenance mode</Text>
          </View>
          <Switch
            value={settings.maintenance_mode}
            onValueChange={(value) => setSettings({ ...settings, maintenance_mode: value })}
            trackColor={{ false: '#E5E7EB', true: '#7C3AED' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Require Approval</Text>
            <Text style={styles.settingDescription}>Require admin approval for new properties</Text>
          </View>
          <Switch
            value={settings.require_approval}
            onValueChange={(value) => setSettings({ ...settings, require_approval: value })}
            trackColor={{ false: '#E5E7EB', true: '#7C3AED' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Max Rental Days</Text>
            <Text style={styles.settingDescription}>Maximum days for a rental agreement</Text>
          </View>
          <TextInput
            style={styles.numberInput}
            value={settings.max_rental_days.toString()}
            onChangeText={(text) => setSettings({ ...settings, max_rental_days: parseInt(text) || 0 })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Default Rental Fee</Text>
            <Text style={styles.settingDescription}>Default fee for rental agreements (RWF)</Text>
          </View>
          <TextInput
            style={styles.numberInput}
            value={settings.default_rental_fee.toString()}
            onChangeText={(text) => setSettings({ ...settings, default_rental_fee: parseInt(text) || 0 })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email Settings</Text>

        <View style={styles.settingItemVertical}>
          <Text style={styles.settingLabel}>Notification Email</Text>
          <Text style={styles.settingDescription}>Email for system notifications</Text>
          <TextInput
            style={styles.textInput}
            value={settings.notification_email}
            onChangeText={(text) => setSettings({ ...settings, notification_email: text })}
            placeholder="admin@example.com"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.settingItemVertical}>
          <Text style={styles.settingLabel}>Admin Email</Text>
          <Text style={styles.settingDescription}>Email for admin contacts</Text>
          <TextInput
            style={styles.textInput}
            value={settings.admin_email}
            onChangeText={(text) => setSettings({ ...settings, admin_email: text })}
            placeholder="admin@example.com"
            keyboardType="email-address"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform Actions</Text>

        <TouchableOpacity style={styles.backupButton}>
          <Text style={styles.backupButtonText}>📦 Backup Database</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearCacheButton}>
          <Text style={styles.clearCacheButtonText}>🗑️ Clear System Cache</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
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
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingItemVertical: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 100,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  backupButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  backupButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  clearCacheButton: {
    backgroundColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearCacheButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});