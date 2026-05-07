import api from './axios'

export const getProperties = (params) => api.get('/properties', { params })
export const getProperty = (id) => api.get(`/properties/${id}`)
export const getMyProperties = () => api.get('/properties/my')
export const addProperty = (data) => api.post('/properties', data)
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data)
export const deleteProperty = (id) => api.delete(`/properties/${id}`)