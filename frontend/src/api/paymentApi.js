import api from './axios'

export const recordPayment = (data) => api.post('/payments', data)
export const getLandlordPayments = () => api.get('/payments/landlord')
export const getTenantPayments = () => api.get('/payments/tenant')
export const getPaymentSummary = () => api.get('/payments/summary')
export const getMonthlyReport = (year) => api.get('/payments/report', { params: { year } })
export const getRentalPayments = (rental_id) => api.get(`/payments/rental/${rental_id}`)
export const updatePaymentStatus = (id, status) => api.put(`/payments/${id}/status`, { status })