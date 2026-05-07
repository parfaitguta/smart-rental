import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/helpers'

const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : 'http://localhost:5000/api'

export default function TenantMonthSelector({ rentalId, tenantName, propertyTitle, monthlyRent }) {
  const [months, setMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [monthData, setMonthData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (rentalId) {
      fetchMonthlyBreakdown()
    }
  }, [rentalId])

  const fetchMonthlyBreakdown = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/rentals/${rentalId}/monthly-breakdown`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const monthsList = response.data.monthly_breakdown
      setMonths(monthsList)
      if (monthsList.length > 0) {
        setSelectedMonth(monthsList[monthsList.length - 1].month_year)
        setMonthData(monthsList[monthsList.length - 1])
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMonthChange = (e) => {
    const selected = e.target.value
    setSelectedMonth(selected)
    const data = months.find(m => m.month_year === selected)
    setMonthData(data)
  }

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      unpaid: 'bg-red-100 text-red-800'
    }
    const icons = {
      paid: <CheckCircle size={14} className="text-green-600" />,
      partial: <AlertCircle size={14} className="text-yellow-600" />,
      unpaid: <Clock size={14} className="text-red-600" />
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${styles[status]}`}>
        {icons[status]} {status.toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
        Error: {error}
      </div>
    )
  }

  if (months.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg text-sm">
        No payment records found for this tenant
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <h3 className="font-bold flex items-center gap-2">
          <Calendar size={18} /> Monthly Payment Status
        </h3>
        <p className="text-blue-100 text-sm mt-1">{tenantName} - {propertyTitle}</p>
        <p className="text-blue-200 text-xs">Monthly Rent: {formatCurrency(monthlyRent)}</p>
      </div>

      <div className="p-4 border-b bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
        <select
          value={selectedMonth || ''}
          onChange={handleMonthChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        >
          {months.map((month) => (
            <option key={month.month_year} value={month.month_year}>{month.month_name}</option>
          ))}
        </select>
      </div>

      {monthData && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">{monthData.month_name}</h4>
            {getStatusBadge(monthData.status)}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-blue-600 text-xs">Rent</p>
              <p className="text-sm font-bold text-blue-700">{formatCurrency(monthData.monthly_rent)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-green-600 text-xs">Paid</p>
              <p className="text-sm font-bold text-green-700">{formatCurrency(monthData.paid_amount)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-red-600 text-xs">Remaining</p>
              <p className="text-sm font-bold text-red-700">{formatCurrency(monthData.remaining_amount)}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Payment Progress</span>
              <span className="font-semibold">{Math.round(monthData.payment_percentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${monthData.status === 'paid' ? 'bg-green-500' : monthData.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(monthData.payment_percentage, 100)}%` }} />
            </div>
          </div>

          {monthData.payments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Transactions</p>
              <div className="space-y-1">
                {monthData.payments.map((payment, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-2 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monthData.payments.length === 0 && monthData.status === 'unpaid' && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-gray-500 text-sm">No payments recorded for this month</p>
            </div>
          )}
        </div>
      )}

      <div className="border-t p-3 bg-gray-50">
        <p className="text-xs text-gray-600 mb-2">Payment Summary</p>
        <div className="flex justify-between text-xs">
          <div className="text-center"><p className="text-gray-500">Total</p><p className="font-semibold">{months.length}</p></div>
          <div className="text-center"><p className="text-green-600">Paid</p><p className="font-semibold text-green-600">{months.filter(m => m.status === 'paid').length}</p></div>
          <div className="text-center"><p className="text-yellow-600">Partial</p><p className="font-semibold text-yellow-600">{months.filter(m => m.status === 'partial').length}</p></div>
          <div className="text-center"><p className="text-red-600">Unpaid</p><p className="font-semibold text-red-600">{months.filter(m => m.status === 'unpaid').length}</p></div>
        </div>
      </div>
    </div>
  )
}