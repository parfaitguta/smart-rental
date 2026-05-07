import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageProvider } from './context/LanguageContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import SearchPropertiesScreen from './screens/SearchPropertiesScreen';
import PropertyDetailScreen from './screens/PropertyDetailScreen';
import MyRentalsScreen from './screens/MyRentalsScreen';
import MyInvoicesScreen from './screens/MyInvoicesScreen';
import MessagesScreen from './screens/MessagesScreen';
import ProfileScreen from './screens/ProfileScreen';
import MonthlyPaymentScreen from './screens/MonthlyPaymentScreen';

// Landlord Screens
import LandlordDashboardScreen from './screens/landlord/LandlordDashboardScreen';
import LandlordPropertiesScreen from './screens/landlord/LandlordPropertiesScreen';
import LandlordPaymentsScreen from './screens/landlord/LandlordPaymentsScreen';
import TenantMonthlyPaymentScreen from './screens/landlord/TenantMonthlyPaymentScreen';
import LandlordTenantsScreen from './screens/landlord/LandlordTenantsScreen';
import LandlordRequestsScreen from './screens/landlord/LandlordRequestsScreen';
import LandlordRentalsScreen from './screens/landlord/LandlordRentalsScreen';
import ManageRentalScreen from './screens/landlord/ManageRentalScreen';
import CreateRentalAgreementScreen from './screens/landlord/CreateRentalAgreementScreen';

// Admin Screens
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminPropertiesScreen from './screens/admin/AdminPropertiesScreen';
import AdminRentalsScreen from './screens/admin/AdminRentalsScreen';
import AdminPaymentsScreen from './screens/admin/AdminPaymentsScreen';
import AdminReportsScreen from './screens/admin/AdminReportsScreen';
import AdminSettingsScreen from './screens/admin/AdminSettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          
          {/* Renter Screens */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="SearchProperties" component={SearchPropertiesScreen} options={{ title: 'Search Properties' }} />
          <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} options={{ title: 'Property Details' }} />
          <Stack.Screen name="MyRentals" component={MyRentalsScreen} options={{ title: 'My Rentals' }} />
          <Stack.Screen name="MyInvoices" component={MyInvoicesScreen} options={{ title: 'My Invoices' }} />
          <Stack.Screen name="Messages" component={MessagesScreen} options={{ title: 'Messages' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
          <Stack.Screen name="MonthlyPayment" component={MonthlyPaymentScreen} options={{ title: 'Monthly Payment' }} />
          
          {/* Landlord Screens */}
          <Stack.Screen name="LandlordDashboard" component={LandlordDashboardScreen} options={{ title: 'Dashboard' }} />
          <Stack.Screen name="LandlordProperties" component={LandlordPropertiesScreen} options={{ title: 'My Properties' }} />
          <Stack.Screen name="LandlordPayments" component={LandlordPaymentsScreen} options={{ title: 'Payments' }} />
          <Stack.Screen name="TenantMonthlyPayment" component={TenantMonthlyPaymentScreen} options={{ title: 'Tenant Payment Tracker' }} />
          <Stack.Screen name="LandlordTenants" component={LandlordTenantsScreen} options={{ title: 'My Tenants' }} />
          <Stack.Screen name="LandlordRequests" component={LandlordRequestsScreen} options={{ title: 'Rental Requests' }} />
          <Stack.Screen name="LandlordRentals" component={LandlordRentalsScreen} options={{ title: 'Rentals' }} />
          <Stack.Screen name="ManageRental" component={ManageRentalScreen} options={{ title: 'Manage Rental' }} />
          <Stack.Screen name="CreateRentalAgreement" component={CreateRentalAgreementScreen} options={{ title: 'Create Rental Agreement' }} />
          
          {/* Admin Screens */}
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'User Management' }} />
          <Stack.Screen name="AdminProperties" component={AdminPropertiesScreen} options={{ title: 'All Properties' }} />
          <Stack.Screen name="AdminRentals" component={AdminRentalsScreen} options={{ title: 'All Rentals' }} />
          <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} options={{ title: 'All Payments' }} />
          <Stack.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: 'Reports' }} />
          <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}