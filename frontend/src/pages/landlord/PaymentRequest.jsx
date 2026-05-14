// frontend/src/pages/landlord/PaymentRequestScreen.jsx
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Send, Calendar, DollarSign, User, Home, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function PaymentRequestScreen() {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    rental_id: '',
    month_year: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    note: '',
  });

  useEffect(() => {
    fetchTenants();
    fetchRequests();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await api.get('/tenants/landlord');
      setTenants(res.data.tenants || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/payment-requests/landlord');
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTenant = (tenant) => {
    setSelectedTenant(tenant);
    setForm({
      ...form,
      rental_id: tenant.rental_id,
      amount: tenant.monthly_rent.toString(),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/payment-requests', form);
      toast.success('Payment request sent to tenant!');
      setShowForm(false);
      setSelectedTenant(null);
      setForm({
        rental_id: '',
        month_year: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        note: '',
      });
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle size={14} className="text-green-600" />;
      case 'overdue': return <AlertCircle size={14} className="text-red-600" />;
      default: return <Clock size={14} className="text-yellow-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payment Requests</h1>
        <p className="text-gray-500 text-sm">Request rent payments from tenants</p>
      </div>

      {/* Tenant List for Request */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Request Payment From</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="bg-white rounded-xl shadow-sm p-4 border hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{tenant.full_name}</p>
                  <p className="text-xs text-gray-500">{tenant.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Home size={14} />
                <span>{tenant.property_title}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-blue-600 font-bold">{formatCurrency(tenant.monthly_rent)}/month</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tenant.payment_status || 'pending')}`}>
                  {tenant.payment_status || 'Active'}
                </span>
              </div>
              <button
                onClick={() => selectTenant(tenant)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Send size={14} /> Request Payment
              </button>
            </div>
          ))}
          {tenants.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No active tenants found
            </div>
          )}
        </div>
      </div>

      {/* Payment Request Form Modal */}
      {showForm && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Request Payment</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600">Tenant: <span className="font-semibold">{selectedTenant.full_name}</span></p>
              <p className="text-sm text-gray-600">Property: <span className="font-semibold">{selectedTenant.property_title}</span></p>
              <p className="text-sm text-blue-600">Monthly Rent: {formatCurrency(selectedTenant.monthly_rent)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month/Year *</label>
                <input
                  type="text"
                  placeholder="e.g., May 2026"
                  value={form.month_year}
                  onChange={(e) => setForm({ ...form, month_year: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RWF) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Please pay May 2026 rent"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Requests List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Sent Requests</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-400">No payment requests sent yet</p>
            <p className="text-gray-300 text-sm mt-1">Click "Request Payment" above to send a request</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl shadow-sm p-4 border">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{req.month_year}</p>
                    <p className="text-sm text-gray-600">{req.tenant_name} • {req.property_title}</p>
                    <p className="text-xs text-gray-400">Due: {formatDate(req.due_date)}</p>
                    {req.note && <p className="text-xs text-gray-500 mt-1">Note: {req.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-700">{formatCurrency(req.amount)}</p>
                    <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(req.status)}`}>
                      {getStatusIcon(req.status)}
                      <span>{req.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}