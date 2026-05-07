import api from './axios'

export const sendMessage = (data) => api.post('/messages', data)
export const getConversations = () => api.get('/messages/conversations')
export const getChat = (userId) => api.get(`/messages/${userId}`)
export const getUnreadCount = () => api.get('/messages/unread/count')