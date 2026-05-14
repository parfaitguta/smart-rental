// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyOTP from './pages/auth/VerifyOTP';

// Common Pages
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import MyActivity from './pages/MyActivity';
import Settings from './pages/Settings';

// Renter Pages
import SearchProperties from './pages/renter/SearchProperties';
import PropertyDetail from './pages/renter/PropertyDetail';
import MyRentals from './pages/renter/MyRentals';
import MyInvoices from './pages/renter/MyInvoices';
import MyRequests from './pages/renter/MyRequests';
import MyReviews from './pages/renter/MyReviews';

// Landlord Pages
import LandlordDashboard from './pages/landlord/Dashboard';
import MyProperties from './pages/landlord/MyProperties';
import AddProperty from './pages/landlord/AddProperty';
import ManageRentals from './pages/landlord/ManageRentals';
import ManageTenants from './pages/landlord/ManageTenants';
import LandlordPayments from './pages/landlord/Payments';
import ManageRequests from './pages/landlord/ManageRequests';
import LandlordInvoices from './pages/landlord/LandlordInvoices';
import LandlordReviews from './pages/landlord/LandlordReviews';
import PaymentRequest from './pages/landlord/PaymentRequest';
import LandlordWallet from './pages/landlord/LandlordWallet';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminActivity from './pages/admin/AdminActivity';
import AdminReports from './pages/admin/AdminReports';
import SystemSettings from './pages/admin/SystemSettings';

// Layout wrapper component
const PageLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
};

function App() {
  // Check if user is logged in
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token && token !== 'undefined' && token !== 'null';
  };

  // Get user role from localStorage
  const getUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        const user = JSON.parse(userStr);
        return user.role;
      }
    } catch (e) {
      console.error('Error parsing user:', e);
    }
    return null;
  };

  // Determine dashboard route based on role
  const getDashboardRoute = () => {
    const role = getUserRole();
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'landlord':
        return '/landlord/dashboard';
      case 'renter':
        return '/search';
      default:
        return '/';
    }
  };

  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            {/* Public Routes - No Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* Home Route */}
            <Route 
              path="/" 
              element={
                isAuthenticated() ? 
                  <Navigate to={getDashboardRoute()} replace /> : 
                  <HomePage />
              } 
            />

            {/* Protected Routes with Layout */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <PageLayout>
                  <Profile />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <PageLayout>
                  <Settings />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/messages" element={
              <ProtectedRoute>
                <PageLayout>
                  <Messages />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/my-activity" element={
              <ProtectedRoute>
                <PageLayout>
                  <MyActivity />
                </PageLayout>
              </ProtectedRoute>
            } />

            {/* Renter Routes */}
            <Route path="/search" element={
              <ProtectedRoute allowedRoles={['renter']}>
                <PageLayout>
                  <SearchProperties />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/property/:id" element={
              <ProtectedRoute allowedRoles={['renter']}>
                <PageLayout>
                  <PropertyDetail />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/my-rentals" element={
              <ProtectedRoute allowedRoles={['renter']}>
                <PageLayout>
                  <MyRentals />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/my-invoices" element={
              <ProtectedRoute allowedRoles={['renter']}>
                <PageLayout>
                  <MyInvoices />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/my-requests" element={
              <ProtectedRoute allowedRoles={['renter']}>
                <PageLayout>
                  <MyRequests />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/my-reviews" element={
              <ProtectedRoute allowedRoles={['renter']}>
                <PageLayout>
                  <MyReviews />
                </PageLayout>
              </ProtectedRoute>
            } />

            {/* Landlord Routes */}
            <Route path="/landlord/dashboard" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <PageLayout>
                  <LandlordDashboard />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/landlord/properties" element={
              <ProtectedRoute allowedRoles={'landlord'}>
                <PageLayout>
                  <MyProperties />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/landlord/add-property" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <PageLayout>
                  <AddProperty />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/landlord/edit-property/:id" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <PageLayout>
                  <AddProperty />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/landlord/rentals" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <PageLayout>
                  <ManageRentals />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/landlord/tenants" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <PageLayout>
                  <ManageTenants />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/landlord/payments" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <PageLayout>
                  <LandlordPayments />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/landlord/payment-requests" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <PageLayout>
                  <PaymentRequest />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/landlord/requests" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <PageLayout>
                  <ManageRequests />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/landlord/invoices" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <PageLayout>
                  <LandlordInvoices />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/landlord/reviews" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <PageLayout>
                  <LandlordReviews />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/landlord/wallet" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <PageLayout>
                  <LandlordWallet />
                </PageLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageLayout>
                  <AdminDashboard />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageLayout>
                  <AdminUsers />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/properties" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageLayout>
                  <AdminProperties />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageLayout>
                  <AdminReports />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/activity" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageLayout>
                  <AdminActivity />
                </PageLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageLayout>
                  <SystemSettings />
                </PageLayout>
              </ProtectedRoute>
            } />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;