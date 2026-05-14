// frontend/src/pages/admin/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Users, Home, DollarSign, FileText, Printer, FileSpreadsheet, FileJson, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '../../utils/downloadUtils';

export default function AdminReports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('properties');
  const [dateRange, setDateRange] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const reportTypes = [
    { id: 'properties', label: 'Properties Report', icon: Home, color: 'blue' },
    { id: 'users', label: 'Users Report', icon: Users, color: 'green' },
    { id: 'payments', label: 'Payments Report', icon: DollarSign, color: 'purple' },
    { id: 'rentals', label: 'Rentals Report', icon: FileText, color: 'orange' },
  ];

  const dateRanges = [
    { id: 'week', label: 'Last 7 Days', days: 7 },
    { id: 'month', label: 'Last 30 Days', days: 30 },
    { id: 'quarter', label: 'Last 3 Months', days: 90 },
    { id: 'year', label: 'Last 12 Months', days: 365 },
    { id: 'all', label: 'All Time', days: null },
  ];

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const getDateFilter = () => {
    const range = dateRanges.find(r => r.id === dateRange);
    if (!range || !range.days) return null;
    const date = new Date();
    date.setDate(date.getDate() - range.days);
    return date;
  };

  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];
      let summary = {};
      const dateFilter = getDateFilter();

      switch (reportType) {
        case 'properties':
          try {
            const propertiesRes = await api.get('/admin/properties');
            let properties = propertiesRes.data.properties || [];
            if (dateFilter) {
              properties = properties.filter(p => p.created_at && new Date(p.created_at) >= dateFilter);
            }
            data = properties.map(p => ({
              id: p.id || 'N/A',
              title: p.title || 'Untitled',
              location: `${p.district || 'N/A'}, ${p.province || 'N/A'}`,
              price: formatCurrency(safeNumber(p.price)),
              status: p.status || 'unknown',
              created_at: p.created_at ? formatDate(p.created_at) : 'N/A',
              landlord: p.landlord_name || 'N/A'
            }));
            summary = {
              total: data.length,
              available: properties.filter(p => p.status === 'available').length,
              rented: properties.filter(p => p.status === 'rented').length,
              totalValue: formatCurrency(properties.reduce((sum, p) => sum + safeNumber(p.price), 0))
            };
          } catch (err) {
            console.error('Properties API error:', err);
            setError('Failed to load properties data. Please check if the API endpoint exists.');
            data = [];
            summary = { total: 0, available: 0, rented: 0, totalValue: formatCurrency(0) };
          }
          break;

        case 'users':
          try {
            const usersRes = await api.get('/admin/users');
            let users = usersRes.data.users || [];
            if (dateFilter) {
              users = users.filter(u => u.created_at && new Date(u.created_at) >= dateFilter);
            }
            data = users.map(u => ({
              id: u.id || 'N/A',
              name: u.full_name || 'Unknown',
              email: u.email || 'N/A',
              role: u.role || 'N/A',
              phone: u.phone || 'N/A',
              status: u.status || 'active',
              created_at: u.created_at ? formatDate(u.created_at) : 'N/A'
            }));
            summary = {
              total: data.length,
              renters: users.filter(u => u.role === 'renter').length,
              landlords: users.filter(u => u.role === 'landlord').length,
              admins: users.filter(u => u.role === 'admin').length
            };
          } catch (err) {
            console.error('Users API error:', err);
            setError('Failed to load users data. Please check if the API endpoint exists.');
            data = [];
            summary = { total: 0, renters: 0, landlords: 0, admins: 0 };
          }
          break;

        case 'payments':
          try {
            const paymentsRes = await api.get('/admin/payments');
            let payments = paymentsRes.data.payments || [];
            if (dateFilter) {
              payments = payments.filter(p => p.payment_date && new Date(p.payment_date) >= dateFilter);
            }
            data = payments.map(p => ({
              id: p.id || 'N/A',
              tenant: p.tenant_name || 'N/A',
              property: p.property_title || 'N/A',
              amount: formatCurrency(safeNumber(p.amount)),
              date: p.payment_date ? formatDate(p.payment_date) : 'N/A',
              method: p.method?.replace('_', ' ') || 'N/A',
              status: p.status || 'N/A'
            }));
            summary = {
              total: data.length,
              totalAmount: formatCurrency(payments.reduce((sum, p) => sum + safeNumber(p.amount), 0)),
              completed: payments.filter(p => p.status === 'paid').length,
              pending: payments.filter(p => p.status === 'pending').length
            };
          } catch (err) {
            console.error('Payments API error:', err);
            setError('Failed to load payments data. Please check if the API endpoint exists.');
            data = [];
            summary = { total: 0, totalAmount: formatCurrency(0), completed: 0, pending: 0 };
          }
          break;

        case 'rentals':
          try {
            const rentalsRes = await api.get('/admin/rentals');
            let rentals = rentalsRes.data.rentals || [];
            if (dateFilter) {
              rentals = rentals.filter(r => r.start_date && new Date(r.start_date) >= dateFilter);
            }
            data = rentals.map(r => ({
              id: r.id || 'N/A',
              tenant: r.tenant_name || 'N/A',
              property: r.property_title || 'N/A',
              monthly_rent: formatCurrency(safeNumber(r.monthly_rent)),
              start_date: r.start_date ? formatDate(r.start_date) : 'N/A',
              end_date: r.end_date ? formatDate(r.end_date) : 'Ongoing',
              status: r.status || 'N/A'
            }));
            summary = {
              total: data.length,
              active: rentals.filter(r => r.status === 'active').length,
              terminated: rentals.filter(r => r.status === 'terminated').length,
              totalMonthlyValue: formatCurrency(rentals.reduce((sum, r) => sum + safeNumber(r.monthly_rent), 0))
            };
          } catch (err) {
            console.error('Rentals API error:', err);
            setError('Failed to load rentals data. Please check if the API endpoint exists.');
            data = [];
            summary = { total: 0, active: 0, terminated: 0, totalMonthlyValue: formatCurrency(0) };
          }
          break;

        default:
          break;
      }

      setReportData({ data, summary });
    } catch (error) {
      console.error('Error fetching report:', error);
      setError(error.message || 'Failed to load report data');
      setReportData({ data: [], summary: {} });
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    switch (reportType) {
      case 'properties':
        return ['ID', 'Title', 'Location', 'Price', 'Status', 'Created', 'Landlord'];
      case 'users':
        return ['ID', 'Name', 'Email', 'Role', 'Phone', 'Status', 'Joined'];
      case 'payments':
        return ['ID', 'Tenant', 'Property', 'Amount', 'Date', 'Method', 'Status'];
      case 'rentals':
        return ['ID', 'Tenant', 'Property', 'Monthly Rent', 'Start Date', 'End Date', 'Status'];
      default:
        return [];
    }
  };

  const getRowData = (item) => {
    switch (reportType) {
      case 'properties':
        return [item.id, item.title, item.location, item.price, item.status, item.created_at, item.landlord];
      case 'users':
        return [item.id, item.name, item.email, item.role, item.phone, item.status, item.created_at];
      case 'payments':
        return [item.id, item.tenant, item.property, item.amount, item.date, item.method, item.status];
      case 'rentals':
        return [item.id, item.tenant, item.property, item.monthly_rent, item.start_date, item.end_date, item.status];
      default:
        return [];
    }
  };

  const prepareDataForExport = () => {
    if (!reportData?.data?.length) return [];
    
    const columns = getColumns();
    return reportData.data.map(item => {
      const rowData = getRowData(item);
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = rowData[idx];
      });
      return obj;
    });
  };

  const handleExport = (format) => {
    if (!reportData?.data?.length) {
      toast.error('No data to export');
      return;
    }

    const exportData = prepareDataForExport();
    const columns = getColumns().map(col => ({ header: col, accessor: (row) => row[col] }));
    const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'csv':
        exportToCSV(exportData, filename, columns);
        break;
      case 'excel':
        exportToExcel(exportData, filename, columns);
        break;
      case 'pdf':
        exportToPDF(exportData, filename, columns, `${reportType.toUpperCase()} Report`);
        break;
      case 'print':
        printData(exportData, columns, `${reportType.toUpperCase()} Report`);
        break;
    }
    toast.success(`Report exported as ${format.toUpperCase()}`);
    setShowExportMenu(false);
  };

  const currentReportType = reportTypes.find(r => r.id === reportType);
  const CurrentIcon = currentReportType?.icon;

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColorClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${textColorClass}`}>Reports</h1>
          <p className={`${textSecondaryClass} text-sm mt-1`}>Generate and export system reports</p>
        </div>

        {/* Report Controls */}
        <div className={`${cardBgClass} rounded-lg shadow p-4 mb-6 border ${borderClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Report Type</label>
              <div className="flex flex-wrap gap-2">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  const isActive = reportType === type.id;
                  const activeClasses = isActive 
                    ? `bg-${type.color}-600 text-white` 
                    : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setReportType(type.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeClasses}`}
                    >
                      <Icon size={16} />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Date Range</label>
              <div className="flex flex-wrap gap-2">
                {dateRanges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setDateRange(range.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                      dateRange === range.id
                        ? 'bg-blue-600 text-white'
                        : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                    }`}
                  >
                    <Calendar size={14} />
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={loading || !reportData?.data?.length}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <Download size={16} />
                Export Report
              </button>
              {showExportMenu && (
                <div className={`absolute right-0 mt-2 w-36 ${cardBgClass} rounded-lg shadow-lg border ${borderClass} z-10`}>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FileText size={14} /> CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FileSpreadsheet size={14} /> Excel
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FileJson size={14} /> PDF
                  </button>
                  <button
                    onClick={() => handleExport('print')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-t"
                  >
                    <Printer size={14} /> Print
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 dark:text-red-400 font-medium">Error loading report</p>
              <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
              <button 
                onClick={fetchReportData}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {reportData?.summary && Object.keys(reportData.summary).length > 0 && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(reportData.summary).map(([key, value], idx) => (
              <div key={idx} className={`${cardBgClass} rounded-lg p-4 border ${borderClass}`}>
                <CurrentIcon size={24} className={`text-${currentReportType?.color}-500 mb-2`} />
                <p className={`text-sm ${textSecondaryClass}`}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}</p>
                <p className={`text-2xl font-bold ${textColorClass}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Data Table */}
        <div className={`${cardBgClass} rounded-lg shadow overflow-hidden border ${borderClass}`}>
          <div className={`p-4 border-b ${borderClass}`}>
            <h2 className={`text-lg font-semibold ${textColorClass}`}>Report Data</h2>
            <p className={`text-sm ${textSecondaryClass}`}>{reportData?.data?.length || 0} records found</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className={`${textSecondaryClass}`}>Unable to load report data</p>
              <button 
                onClick={fetchReportData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : reportData?.data?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    {getColumns().map((col, idx) => (
                      <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${cardBgClass} divide-y ${borderClass}`}>
                  {reportData.data.map((item, idx) => (
                    <tr key={idx} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                      {getRowData(item).map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className={`${textSecondaryClass}`}>No data available for the selected filters</p>
              <p className={`text-sm ${textSecondaryClass} mt-2`}>Try changing the report type or date range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}