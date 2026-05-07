import api from './axios'

export const createPaymentRequest = (data) => api.post('/payment-requests', data)
export const getLandlordPaymentRequests = () => api.get('/payment-requests/landlord')
export const getTenantPaymentRequests = () => api.get('/payment-requests/tenant')
export const getRentalPaymentRequests = (rentalId) => api.get(`/payment-requests/rental/${rentalId}`)
export const updatePaymentRequestStatus = (id, status) => api.put(`/payment-requests/${id}/status`, { status })
export const deletePaymentRequest = (id) => api.delete(`/payment-requests/${id}`)