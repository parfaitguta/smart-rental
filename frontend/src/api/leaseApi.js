// frontend/src/api/leaseApi.js
import { API_BASE_URL } from '../config'

export const downloadLease = async (rentalId) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/lease/${rentalId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to generate lease')
  }
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lease-agreement-${rentalId}.pdf`
  a.click()
  window.URL.revokeObjectURL(url)
}