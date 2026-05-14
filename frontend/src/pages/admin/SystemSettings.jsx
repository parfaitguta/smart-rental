// frontend/src/pages/admin/SystemSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Save, Globe, DollarSign, Mail, Lock, Bell, Database,
  Smartphone, CreditCard, Server, Shield, Users, Settings as SettingsIcon,
  Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw, X,
  Phone, MessageSquare, Receipt, TrendingUp
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function SystemSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [backendConfig, setBackendConfig] = useState(null);

  const [settings, setSettings] = useState({
    general: {
      site_name: 'Smart Rental',
      site_description: 'Rental platform for Rwanda',
      contact_email: 'admin@smartrental.com',
      contact_phone: '+250 788 123 456',
      address: 'Kigali, Rwanda',
      currency: 'RWF',
      timezone: 'Africa/Kigali',
      language: 'en'
    },
    payment: {
      paypack_enabled: true,
      paypack_client_id: '',
      paypack_client_secret: '',
      paypack_api_url: 'https://payments.paypack.rw/api',
      paypack_environment: 'production',
      paypack_mode: 'live',
      test_mode: false
    },
    email: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: '587',
      smtp_user: '',
      smtp_password: '',
      smtp_encryption: 'tls',
      from_email: '',
      from_name: 'Smart Rental RW'
    },
    security: {
      min_password_length: 6,
      require_uppercase: true,
      require_numbers: true,
      require_special_chars: false,
      session_timeout: 60,
      two_factor_auth: false,
      max_login_attempts: 5
    },
    notifications: {
      email_notifications: true,
      push_notifications: true,
      payment_receipts: true,
      new_registration_alerts: true,
      property_approval_alerts: true,
      report_generation_alerts: false
    },
    backup: {
      auto_backup: true,
      backup_frequency: 'daily',
      backup_time: '02:00',
      backup_retention_days: 30,
      backup_location: 'database'
    }
  });

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    loadSettings();
    fetchBackendConfig();
  }, []);

  // Fetch current backend configuration - CORRECTED ENDPOINT
  const fetchBackendConfig = async () => {
    try {
      const response = await api.get('/admin-settings/payment-config');
      setBackendConfig(response.data);

      // Update settings with backend config
      if (response.data) {
        setSettings(prev => ({
          ...prev,
          payment: {
            ...prev.payment,
            paypack_client_id: response.data.PAYPACK_CLIENT_ID || '',
            paypack_client_secret: response.data.PAYPACK_CLIENT_SECRET || '',
            paypack_api_url: response.data.PAYPACK_BASE_URL || 'https://payments.paypack.rw/api',
            paypack_environment: response.data.PAYPACK_ENVIRONMENT || 'production',
            paypack_mode: response.data.PAYPACK_MODE || 'live',
            test_mode: response.data.PAYPACK_MODE === 'sandbox'
          },
          email: {
            ...prev.email,
            smtp_user: response.data.EMAIL_USER || '',
            from_email: response.data.EMAIL_FROM || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching backend config:', error);
    }
  };

  // Save payment config to backend - CORRECTED ENDPOINT
  const savePaymentConfig = async () => {
    setSaving(true);
    try {
      const paymentData = {
        PAYPACK_CLIENT_ID: settings.payment.paypack_client_id,
        PAYPACK_CLIENT_SECRET: settings.payment.paypack_client_secret,
        PAYPACK_BASE_URL: settings.payment.paypack_api_url,
        PAYPACK_ENVIRONMENT: settings.payment.test_mode ? 'sandbox' : 'production',
        PAYPACK_MODE: settings.payment.test_mode ? 'sandbox' : 'live'
      };

      const response = await api.put('/admin-settings/payment-config', paymentData);

      if (response.data.success) {
        toast.success('Payment settings saved to backend!');
        fetchBackendConfig(); // Refresh backend config
      } else {
        toast.error('Failed to save payment settings');
      }
    } catch (error) {
      console.error('Error saving payment config:', error);
      toast.error('Failed to save payment settings to backend');
    } finally {
      setSaving(false);
    }
  };

  // Load settings from localStorage
  const loadSettings = () => {
    setLoading(true);
    try {
      const savedSettings = localStorage.getItem('system_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsed
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save general settings to localStorage
  const handleSave = async (section) => {
    setSaving(true);
    try {
      const currentSettings = { ...settings };
      localStorage.setItem('system_settings', JSON.stringify(currentSettings));

      if (section === 'payment') {
        await savePaymentConfig();
      } else {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved locally!`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, color: 'blue' },
    { id: 'payment', label: 'Payment', icon: CreditCard, color: 'green' },
    { id: 'email', label: 'Email', icon: Mail, color: 'purple' },
    { id: 'security', label: 'Security', icon: Shield, color: 'red' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'yellow' },
    { id: 'backup', label: 'Backup', icon: Database, color: 'indigo' },
  ];

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColorClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBgClass = darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300';
  const labelClass = darkMode ? 'text-gray-300' : 'text-gray-700';

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${bgClass}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${textColorClass}`}>System Settings</h1>
          <p className={`${textSecondaryClass} text-sm mt-1`}>Configure platform settings</p>
        </div>

        {/* Tabs */}
        <div className={`flex flex-wrap gap-2 mb-6 border-b ${borderClass} pb-2`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? `bg-${tab.color}-600 text-white`
                    : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className={`${cardBgClass} rounded-lg shadow border ${borderClass} p-6`}>
            <h2 className={`text-lg font-semibold ${textColorClass} mb-4 flex items-center gap-2`}>
              <Globe size={20} className="text-blue-500" />
              General Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Site Name</label>
                <input
                  type="text"
                  value={settings.general.site_name}
                  onChange={(e) => updateSetting('general', 'site_name', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Site Description</label>
                <input
                  type="text"
                  value={settings.general.site_description}
                  onChange={(e) => updateSetting('general', 'site_description', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Contact Email</label>
                <input
                  type="email"
                  value={settings.general.contact_email}
                  onChange={(e) => updateSetting('general', 'contact_email', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Contact Phone</label>
                <input
                  type="text"
                  value={settings.general.contact_phone}
                  onChange={(e) => updateSetting('general', 'contact_phone', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Address</label>
                <input
                  type="text"
                  value={settings.general.address}
                  onChange={(e) => updateSetting('general', 'address', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Currency</label>
                <select
                  value={settings.general.currency}
                  onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="RWF">Rwandan Franc (RWF)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Timezone</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="Africa/Kigali">Africa/Kigali</option>
                  <option value="Africa/Nairobi">Africa/Nairobi</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Default Language</label>
                <select
                  value={settings.general.language}
                  onChange={(e) => updateSetting('general', 'language', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="en">English</option>
                  <option value="kinyarwanda">Kinyarwanda</option>
                  <option value="french">French</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleSave('general')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Payment Settings - Syncs with Backend */}
        {activeTab === 'payment' && (
          <div className={`${cardBgClass} rounded-lg shadow border ${borderClass} p-6`}>
            <h2 className={`text-lg font-semibold ${textColorClass} mb-4 flex items-center gap-2`}>
              <CreditCard size={20} className="text-green-500" />
              PayPack Payment Settings
            </h2>

            <div className="space-y-6">
              {/* Backend Sync Status */}
              <div className={`p-3 rounded-lg ${backendConfig ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'}`}>
                <div className="flex items-center gap-2">
                  {backendConfig ? (
                    <CheckCircle size={18} className="text-green-500" />
                  ) : (
                    <AlertCircle size={18} className="text-yellow-500" />
                  )}
                  <span className={`text-sm ${backendConfig ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                    {backendConfig ? 'Connected to backend - Settings will update .env file' : 'Loading backend configuration...'}
                  </span>
                </div>
              </div>

              {/* PayPack Status */}
              <div className={`p-4 rounded-lg ${settings.payment.paypack_enabled ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`font-semibold ${settings.payment.paypack_enabled ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {settings.payment.paypack_enabled ? '✅ PayPack is ACTIVE' : '❌ PayPack is DISABLED'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Payments are processed through PayPack gateway
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.payment.paypack_enabled}
                      onChange={(e) => updateSetting('payment', 'paypack_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Enable PayPack</span>
                  </label>
                </div>
              </div>

              {/* PayPack Configuration */}
              <div className={`p-4 rounded-lg border ${borderClass}`}>
                <h3 className={`font-semibold ${textColorClass} mb-3 flex items-center gap-2`}>
                  <Server size={18} className="text-blue-500" />
                  PayPack API Configuration (Syncs with Backend .env)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${labelClass} mb-1`}>Client ID</label>
                    <div className="relative">
                      <input
                        type={showClientId ? 'text' : 'password'}
                        value={settings.payment.paypack_client_id}
                        onChange={(e) => updateSetting('payment', 'paypack_client_id', e.target.value)}
                        className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 font-mono text-sm`}
                        placeholder="Enter PayPack Client ID"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClientId(!showClientId)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showClientId ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Updates PAYPACK_CLIENT_ID in .env</p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${labelClass} mb-1`}>Client Secret</label>
                    <div className="relative">
                      <input
                        type={showClientSecret ? 'text' : 'password'}
                        value={settings.payment.paypack_client_secret}
                        onChange={(e) => updateSetting('payment', 'paypack_client_secret', e.target.value)}
                        className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 font-mono text-sm`}
                        placeholder="Enter PayPack Client Secret"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClientSecret(!showClientSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showClientSecret ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Updates PAYPACK_CLIENT_SECRET in .env</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={`block text-sm font-medium ${labelClass} mb-1`}>API Base URL</label>
                    <input
                      type="text"
                      value={settings.payment.paypack_api_url}
                      onChange={(e) => updateSetting('payment', 'paypack_api_url', e.target.value)}
                      className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 font-mono text-sm`}
                      placeholder="https://payments.paypack.rw/api"
                    />
                    <p className="text-xs text-gray-500 mt-1">Updates PAYPACK_BASE_URL in .env</p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${labelClass} mb-1`}>Environment Mode</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={!settings.payment.test_mode}
                          onChange={() => {
                            updateSetting('payment', 'test_mode', false);
                            updateSetting('payment', 'paypack_environment', 'production');
                            updateSetting('payment', 'paypack_mode', 'live');
                          }}
                          className="text-blue-600"
                        />
                        <span className={`text-sm ${textColorClass}`}>🔴 Live (Production)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={settings.payment.test_mode}
                          onChange={() => {
                            updateSetting('payment', 'test_mode', true);
                            updateSetting('payment', 'paypack_environment', 'sandbox');
                            updateSetting('payment', 'paypack_mode', 'sandbox');
                          }}
                          className="text-blue-600"
                        />
                        <span className={`text-sm ${textColorClass}`}>🟡 Sandbox (Test Mode)</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {settings.payment.test_mode
                        ? 'Sandbox: Test payments, no real money'
                        : 'Live: Real payments with actual money'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Backend Status */}
              {backendConfig && (
                <div className={`p-4 rounded-lg border ${borderClass} bg-gray-50 dark:bg-gray-700/50`}>
                  <h3 className={`font-semibold ${textColorClass} mb-3 flex items-center gap-2`}>
                    <Server size={18} className="text-purple-500" />
                    Current Backend Configuration
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">PAYPACK_ENVIRONMENT:</span>
                      <span className={`font-mono ${backendConfig.PAYPACK_ENVIRONMENT === 'production' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {backendConfig.PAYPACK_ENVIRONMENT || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">PAYPACK_MODE:</span>
                      <span className={`font-mono ${backendConfig.PAYPACK_MODE === 'live' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {backendConfig.PAYPACK_MODE || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">PAYPACK_BASE_URL:</span>
                      <span className="font-mono text-xs">{backendConfig.PAYPACK_BASE_URL || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">PAYPACK_CLIENT_ID:</span>
                      <span className="font-mono text-xs">
                        {backendConfig.PAYPACK_CLIENT_ID ? '✓ Configured' : '❌ Missing'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Flow Information */}
              <div className={`p-4 rounded-lg border ${borderClass} bg-blue-50 dark:bg-blue-900/20`}>
                <h3 className={`font-semibold ${textColorClass} mb-3 flex items-center gap-2`}>
                  <TrendingUp size={18} className="text-blue-500" />
                  Payment Flow
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</div>
                    <span>Tenant requests to pay an invoice</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</div>
                    <span>PayPack sends payment request to tenant's phone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">3</div>
                    <span>Tenant approves payment on their mobile money</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">4</div>
                    <span>Money is transferred from tenant to landlord</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">5</div>
                    <span>Both parties receive SMS confirmation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">6</div>
                    <span>Invoice is marked as PAID in the system</span>
                  </div>
                </div>
              </div>

              {/* Supported Payment Methods */}
              <div className={`p-4 rounded-lg border ${borderClass}`}>
                <h3 className={`font-semibold ${textColorClass} mb-3 flex items-center gap-2`}>
                  <Smartphone size={18} className="text-green-500" />
                  Supported Payment Methods (via PayPack)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-xl">📱</span>
                    <span className="text-sm font-medium">MTN MoMo</span>
                    <CheckCircle size={14} className="text-green-500 ml-auto" />
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-xl">📱</span>
                    <span className="text-sm font-medium">Airtel Money</span>
                    <CheckCircle size={14} className="text-green-500 ml-auto" />
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-xl">🏦</span>
                    <span className="text-sm font-medium">Bank Transfer</span>
                    <CheckCircle size={14} className="text-green-500 ml-auto" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleSave('payment')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving to Backend...' : 'Save to Backend'}
              </button>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <div className={`${cardBgClass} rounded-lg shadow border ${borderClass} p-6`}>
            <h2 className={`text-lg font-semibold ${textColorClass} mb-4 flex items-center gap-2`}>
              <Mail size={20} className="text-purple-500" />
              Email Settings (SMTP)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>SMTP Host</label>
                <input
                  type="text"
                  value={settings.email.smtp_host}
                  onChange={(e) => updateSetting('email', 'smtp_host', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>SMTP Port</label>
                <input
                  type="text"
                  value={settings.email.smtp_port}
                  onChange={(e) => updateSetting('email', 'smtp_port', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>SMTP Username</label>
                <input
                  type="text"
                  value={settings.email.smtp_user}
                  onChange={(e) => updateSetting('email', 'smtp_user', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>SMTP Password</label>
                <input
                  type="password"
                  value={settings.email.smtp_password}
                  onChange={(e) => updateSetting('email', 'smtp_password', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter SMTP password"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>From Email</label>
                <input
                  type="email"
                  value={settings.email.from_email}
                  onChange={(e) => updateSetting('email', 'from_email', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>From Name</label>
                <input
                  type="text"
                  value={settings.email.from_name}
                  onChange={(e) => updateSetting('email', 'from_name', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleSave('email')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className={`${cardBgClass} rounded-lg shadow border ${borderClass} p-6`}>
            <h2 className={`text-lg font-semibold ${textColorClass} mb-4 flex items-center gap-2`}>
              <Shield size={20} className="text-red-500" />
              Security Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Minimum Password Length</label>
                <input
                  type="number"
                  min="4"
                  max="20"
                  value={settings.security.min_password_length}
                  onChange={(e) => updateSetting('security', 'min_password_length', parseInt(e.target.value))}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Session Timeout (minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={settings.security.session_timeout}
                  onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Max Login Attempts</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.security.max_login_attempts}
                  onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.require_uppercase}
                    onChange={(e) => updateSetting('security', 'require_uppercase', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Require Uppercase Letter</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.require_numbers}
                    onChange={(e) => updateSetting('security', 'require_numbers', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Require Numbers</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.require_special_chars}
                    onChange={(e) => updateSetting('security', 'require_special_chars', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Require Special Characters</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.two_factor_auth}
                    onChange={(e) => updateSetting('security', 'two_factor_auth', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Two-Factor Authentication</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleSave('security')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className={`${cardBgClass} rounded-lg shadow border ${borderClass} p-6`}>
            <h2 className={`text-lg font-semibold ${textColorClass} mb-4 flex items-center gap-2`}>
              <Bell size={20} className="text-yellow-500" />
              Notification Settings
            </h2>
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleSave('notifications')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Backup Settings */}
        {activeTab === 'backup' && (
          <div className={`${cardBgClass} rounded-lg shadow border ${borderClass} p-6`}>
            <h2 className={`text-lg font-semibold ${textColorClass} mb-4 flex items-center gap-2`}>
              <Database size={20} className="text-indigo-500" />
              Backup Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Backup Frequency</label>
                <select
                  value={settings.backup.backup_frequency}
                  onChange={(e) => updateSetting('backup', 'backup_frequency', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Backup Time</label>
                <input
                  type="time"
                  value={settings.backup.backup_time}
                  onChange={(e) => updateSetting('backup', 'backup_time', e.target.value)}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${labelClass} mb-1`}>Retention Days</label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={settings.backup.backup_retention_days}
                  onChange={(e) => updateSetting('backup', 'backup_retention_days', parseInt(e.target.value))}
                  className={`w-full ${inputBgClass} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.backup.auto_backup}
                  onChange={(e) => updateSetting('backup', 'auto_backup', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Enable Automatic Backups</span>
              </label>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => {
                  toast.success('Manual backup initiated');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <RefreshCw size={16} />
                Run Backup Now
              </button>
              <button
                onClick={() => handleSave('backup')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}