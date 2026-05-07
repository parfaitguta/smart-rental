import api from './axios'

export const getStats = () => api.get('/admin/stats')
export const getUsers = () => api.get('/admin/users')
export const changeRole = (id, role) => api.put(`/admin/users/${id}/role`, { role })
export const deleteUser = (id) => api.delete(`/admin/users/${id}`)
export const adminGetProperties = () => api.get('/admin/properties')
export const adminDeleteProperty = (id) => api.delete(`/admin/properties/${id}`)
export const adminGetRentals = () => api.get('/admin/rentals')
export const adminGetPayments = () => api.get('/admin/payments')
export const adminGetRequests = () => api.get('/admin/requests')