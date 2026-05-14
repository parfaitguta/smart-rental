import api from './axios'

/** Register / resend wait on SMTP + cold Render — avoid infinite "Creating account..." */
const AUTH_EMAIL_MS = 120000

export const registerUser = (data) =>
  api.post('/auth/register', data, { timeout: AUTH_EMAIL_MS })

export const loginUser = (data) => api.post('/auth/login', data, { timeout: 60000 })

export const verifyOtp = (data) =>
  api.post('/auth/verify-otp', data, { timeout: 45000 })

export const resendOtp = (data) =>
  api.post('/auth/resend-otp', data, { timeout: AUTH_EMAIL_MS })
export const getMe = () => api.get('/auth/me')
export const getProfile = () => api.get('/auth/profile')
export const updateProfile = (data) => api.put('/auth/profile', data)
export const changePassword = (data) => api.put('/auth/change-password', data)