import api from './axios'

export const submitReview = (data) => api.post('/reviews', data)
export const getPropertyReviews = (id) => api.get(`/reviews/property/${id}`)
export const getMyReviews = () => api.get('/reviews/my')
export const getLandlordReviews = () => api.get('/reviews/landlord')
export const deleteReview = (id) => api.delete(`/reviews/${id}`)