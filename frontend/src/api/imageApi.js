import api from './axios'

export const uploadImages = (propertyId, formData) =>
  api.post(`/images/${propertyId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const getPropertyImages = (propertyId) =>
  api.get(`/images/${propertyId}`)

export const deleteImage = (imageId) =>
  api.delete(`/images/delete/${imageId}`)

export const setPrimaryImage = (imageId) =>
  api.put(`/images/${imageId}/primary`)