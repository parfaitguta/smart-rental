import api from './axios'

export const sendRequest = (data) => api.post('/requests', data)
export const getLandlordRequests = () => api.get('/requests/landlord')
export const getRenterRequests = () => api.get('/requests/renter')
export const acceptRequest = (id) => api.put(`/requests/${id}/accept`)
export const rejectRequest = (id) => api.put(`/requests/${id}/reject`)