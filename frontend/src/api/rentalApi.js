import api from './axios'

export const createRental = (data) => api.post('/rentals', data)
export const getLandlordRentals = () => api.get('/rentals/landlord')
export const getTenantRentals = () => api.get('/rentals/tenant')
export const getRental = (id) => api.get(`/rentals/${id}`)
export const terminateRental = (id) => api.put(`/rentals/${id}/terminate`)