import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyOTP from './pages/auth/VerifyOTP'
import HomePage from './pages/Home'
import PropertyView from './pages/PropertyView'
import Profile from './pages/Profile'
import MyActivity from './pages/MyActivity'
import SearchProperties from './pages/renter/SearchProperties'
import PropertyDetail from './pages/renter/PropertyDetail'
import MyRequests from './pages/renter/MyRequests'
import MyRentals from './pages/renter/MyRentals'
import MyReviews from './pages/renter/MyReviews'
import MyInvoices from './pages/renter/MyInvoices'
import Dashboard from './pages/landlord/Dashboard'
import MyProperties from './pages/landlord/MyProperties'
import AddProperty from './pages/landlord/AddProperty'
import ManageRequests from './pages/landlord/ManageRequests'
import ManageRentals from './pages/landlord/ManageRentals'
import ManageTenants from './pages/landlord/ManageTenants'
import TenantPaymentChart from './pages/landlord/TenantPaymentChart'
import Payments from './pages/landlord/Payments'
import LandlordReviews from './pages/landlord/LandlordReviews'
import LandlordInvoices from './pages/landlord/LandlordInvoices'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProperties from './pages/admin/AdminProperties'
import AdminActivity from './pages/admin/AdminActivity'
import Messages from './pages/Messages'

const Layout = ({ children }) => {
  const { user } = useAuth()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {user && <Sidebar />}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Home Page - No Layout needed */}
        <Route path="/" element={<HomePage />} />

        <Route path="/property-view/:id" element={<PropertyView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/unauthorized" element={
          <div className="p-8 text-center text-red-500 text-xl">⚠ Access Denied</div>
        } />

        {/* Renter Routes */}
        <Route path="/search" element={
          <Layout><ProtectedRoute roles={['renter']}><SearchProperties /></ProtectedRoute></Layout>
        } />
        <Route path="/property/:id" element={
          <Layout><ProtectedRoute roles={['renter']}><PropertyDetail /></ProtectedRoute></Layout>
        } />
        <Route path="/my-requests" element={
          <Layout><ProtectedRoute roles={['renter']}><MyRequests /></ProtectedRoute></Layout>
        } />
        <Route path="/my-rentals" element={
          <Layout><ProtectedRoute roles={['renter']}><MyRentals /></ProtectedRoute></Layout>
        } />
        <Route path="/my-reviews" element={
          <Layout><ProtectedRoute roles={['renter']}><MyReviews /></ProtectedRoute></Layout>
        } />
        <Route path="/my-invoices" element={
          <Layout><ProtectedRoute roles={['renter']}><MyInvoices /></ProtectedRoute></Layout>
        } />

        {/* Landlord Routes */}
        <Route path="/landlord/dashboard" element={
          <Layout><ProtectedRoute roles={['landlord']}><Dashboard /></ProtectedRoute></Layout>
        } />
        <Route path="/landlord/properties" element={
          <Layout><ProtectedRoute roles={['landlord']}><MyProperties /></ProtectedRoute></Layout>
        } />
        <Route path="/landlord/properties/add" element={
          <Layout><ProtectedRoute roles={['landlord']}><AddProperty /></ProtectedRoute></Layout>
        } />
        <Route path="/landlord/requests" element={
          <Layout><ProtectedRoute roles={['landlord']}><ManageRequests /></ProtectedRoute></Layout>
        } />
        <Route path="/landlord/rentals" element={
          <Layout><ProtectedRoute roles={['landlord']}><ManageRentals /></ProtectedRoute></Layout>
        } />
        <Route path="/landlord/tenants" element={
          <Layout><ProtectedRoute roles={['landlord']}><ManageTenants /></ProtectedRoute></Layout>
        } />
        <Route path="/landlord/tenants/:rentalId/chart" element={
          <Layout><ProtectedRoute roles={['landlord']}><TenantPaymentChart /></ProtectedRoute></Layout>
        } />
        <Route path="/landlord/payments" element={
          <Layout><ProtectedRoute roles={['landlord']}><Payments /></ProtectedRoute></Layout>
        } />
        <Route path="/landlord/reviews" element={
          <Layout><ProtectedRoute roles={['landlord']}><LandlordReviews /></ProtectedRoute></Layout>
        } />
        <Route path="/landlord/invoices" element={
          <Layout><ProtectedRoute roles={['landlord']}><LandlordInvoices /></ProtectedRoute></Layout>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <Layout><ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute></Layout>
        } />
        <Route path="/admin/users" element={
          <Layout><ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute></Layout>
        } />
        <Route path="/admin/properties" element={
          <Layout><ProtectedRoute roles={['admin']}><AdminProperties /></ProtectedRoute></Layout>
        } />
        <Route path="/admin/activity" element={
          <Layout><ProtectedRoute roles={['admin']}><AdminActivity /></ProtectedRoute></Layout>
        } />

        {/* Shared Routes */}
        <Route path="/messages" element={
          <Layout><ProtectedRoute roles={['renter', 'landlord', 'admin']}><Messages /></ProtectedRoute></Layout>
        } />
        <Route path="/profile" element={
          <Layout><ProtectedRoute roles={['renter', 'landlord', 'admin']}><Profile /></ProtectedRoute></Layout>
        } />
        <Route path="/my-activity" element={
          <Layout><ProtectedRoute roles={['renter', 'landlord', 'admin']}><MyActivity /></ProtectedRoute></Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}