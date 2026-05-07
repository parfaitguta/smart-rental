export const downloadLease = async (rentalId) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`http://localhost:5000/api/lease/${rentalId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) throw new Error('Failed to generate lease')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lease-agreement-${rentalId}.pdf`
  a.click()
  window.URL.revokeObjectURL(url)
}