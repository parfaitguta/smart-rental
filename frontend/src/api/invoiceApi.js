import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Invoice functions
export const getTenantInvoices = () => api.get('/invoices/tenant')
export const getLandlordInvoices = () => api.get('/invoices/landlord')
export const createInvoice = (data) => api.post('/invoices', data)
export const getInvoice = (id) => api.get(`/invoices/${id}`)
export const payInvoice = (id, data) => api.post(`/invoices/${id}/pay`, data)
export const verifyPayment = (invoiceId, paymentId) => api.post('/invoices/verify', { payment_id: paymentId })

// Payment History functions
export const getRentalPaymentHistory = (rentalId) => api.get(`/invoices/rental/${rentalId}/payment-history`)
export const getCurrentMonthStatus = (rentalId) => api.get(`/invoices/rental/${rentalId}/current-status`)
export const getMyPayments = () => api.get('/invoices/my-payments')
export const getLandlordPaymentsAll = () => api.get('/invoices/landlord-payments')