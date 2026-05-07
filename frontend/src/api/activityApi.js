import api from './axios'

export const getMyActivity = (limit) => api.get(`/activities/my?limit=${limit || 50}`)
export const getAllActivity = (limit) => api.get(`/activities/all?limit=${limit || 100}`)
export const getActivityStats = () => api.get('/activities/stats')
export const clearActivityLogs = (days) => api.delete(`/activities/clear?days=${days || 90}`)