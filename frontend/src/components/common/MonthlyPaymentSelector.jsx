import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { API_BASE_URL } from '../../config'

export default function MonthlyPaymentSelector({ rentalId, userRole }) {
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
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      
      // Try multiple possible endpoints
      let response;
      try {
        // Try the main endpoint first
        response = await axios.get(`${API_BASE_URL}/rentals/${rentalId}/monthly-breakdown`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (firstError) {
        console.log('First endpoint failed, trying alternative...')
        // Try alternative endpoint
        response = await axios.get(`${API_BASE_URL}/rentals/${rentalId}/payment-status`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }

      // Handle different response structures
      let monthsList = []
      if (response.data.monthly_breakdown) {
        monthsList = response.data.monthly_breakdown
      } else if (response.data.months) {
        monthsList = response.data.months
      } else if (Array.isArray(response.data)) {
        monthsList = response.data
      }

      setMonths(monthsList)

      if (monthsList.length > 0) {
        // Select the most recent unpaid month first, or latest month
        const unpaidMonth = monthsList.find(m => m.status === 'unpaid')
        const latestMonth = monthsList[monthsList.length - 1]
        setSelectedMonth(unpaidMonth?.month_year || latestMonth.month_year)
        setMonthData(unpaidMonth || latestMonth)
      }
    } catch (error) {
      console.error('Error fetching payment status:', error)
      setError(error.response?.data?.message || error.message || 'Failed to load payment status')
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

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return <CheckCircle size={20} className="text-green-600" />
      case 'partial': return <AlertCircle size={20} className="text-yellow-600" />
      case 'unpaid': return <Clock size={20} className="text-red-600" />
      default: return <Clock size={20} className="text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-300'
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'unpaid': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Unable to load payment status</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchMonthlyBreakdown}
          className="mt-2 text-sm bg-red-100 px-3 py-1 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    )
  }

  if (months.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
        <p>No payment records found for this rental.</p>
        <p className="text-sm mt-1">Payments will appear here once processed.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Calendar size={20} /> Monthly Payment Status
        </h2>
      </div>

      <div className="p-4 border-b bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Month
        </label>
        <select
          value={selectedMonth || ''}
          onChange={handleMonthChange}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {months.map((month) => (
            <option key={month.month_year} value={month.month_year}>
              {month.month_name || month.month_year}
            </option>
          ))}
        </select>
      </div>

      {monthData && (
        <div className="p-5">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">{monthData.month_name || monthData.month_year}</h3>
            <div className="inline-flex items-center gap-2 mt-2">
              {getStatusIcon(monthData.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(monthData.status)}`}>
                {(monthData.status || 'UNKNOWN').toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-blue-600 text-sm">Monthly Rent</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(monthData.monthly_rent || monthData.amount || 0)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-green-600 text-sm">Paid Amount</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(monthData.paid_amount || (monthData.status === 'paid' ? (monthData.monthly_rent || monthData.amount) : 0) || 0)}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm">Remaining</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(monthData.remaining_amount || (monthData.status === 'unpaid' ? (monthData.monthly_rent || monthData.amount) : 0) || 0)}
              </p>
            </div>
          </div>

          {(monthData.payment_percentage !== undefined) && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Payment Progress</span>
                <span className="font-semibold text-blue-600">
                  {Math.round(monthData.payment_percentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    monthData.status === 'paid' ? 'bg-green-500' :
                    monthData.status === 'partial' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(monthData.payment_percentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {monthData.payments && monthData.payments.length > 0 ? (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign size={16} /> Payment Transactions
              </h4>
              <div className="space-y-2">
                {monthData.payments.map((payment, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center border">
                    <div>
                      <p className="font-medium text-gray-800">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-500">{formatDate(payment.date || payment.payment_date)}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Paid</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">No payment transactions recorded for this month</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <h4 className="font-semibold text-gray-700 mb-3">All Months Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Months</p>
                <p className="text-xl font-bold">{months.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-green-600">Paid</p>
                <p className="text-xl font-bold text-green-600">{months.filter(m => m.status === 'paid').length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-yellow-600">Partial</p>
                <p className="text-xl font-bold text-yellow-600">{months.filter(m => m.status === 'partial').length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-red-600">Unpaid</p>
                <p className="text-xl font-bold text-red-600">{months.filter(m => m.status === 'unpaid').length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}