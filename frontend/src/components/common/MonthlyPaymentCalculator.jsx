import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronDown, ChevronUp, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/helpers'

export default function MonthlyPaymentCalculator({ rentalId, userRole }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('all')
  const [expandedMonths, setExpandedMonths] = useState({})

  useEffect(() => {
    if (rentalId) {
      fetchMonthlyBreakdown()
    }
  }, [rentalId])

  const fetchMonthlyBreakdown = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:5000/api/rentals/${rentalId}/monthly-breakdown`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(response.data)
    } catch (error) {
      console.error('Error fetching monthly breakdown:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMonth = (index) => {
    setExpandedMonths(prev => ({ ...prev, [index]: !prev[index] }))
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
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) return null

  const { rental, summary, monthly_breakdown } = data

  const years = [...new Set(monthly_breakdown.map(m => m.year))]
  const filteredMonths = selectedYear === 'all' 
    ? monthly_breakdown 
    : monthly_breakdown.filter(m => m.year === parseInt(selectedYear))

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white">
        <h2 className="text-xl font-bold">📊 Payment Calculator</h2>
        <p className="text-blue-100 mt-1">{rental.property_title}</p>
        <p className="text-blue-200 text-sm mt-1">
          Monthly Rent: {formatCurrency(rental.monthly_rent)}
        </p>
        {userRole === 'landlord' && (
          <p className="text-blue-200 text-sm">Tenant: {rental.tenant_info}</p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-5 bg-gray-50 border-b">
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <p className="text-xs text-gray-500">Total Months</p>
          <p className="text-xl font-bold text-gray-800">{summary.total_months}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600">✅ Paid Months</p>
          <p className="text-xl font-bold text-green-700">{summary.paid_months}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-xs text-yellow-600">⚠️ Partial Months</p>
          <p className="text-xl font-bold text-yellow-700">{summary.partial_months}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-xs text-red-600">❌ Unpaid Months</p>
          <p className="text-xl font-bold text-red-700">{summary.unpaid_months}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600">💰 Total Paid</p>
          <p className="text-xl font-bold text-blue-700">{formatCurrency(summary.total_paid)}</p>
        </div>
      </div>

      {/* Total Progress Bar */}
      <div className="p-5 border-b">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Overall Payment Progress</span>
          <span className="font-semibold text-blue-600">
            {Math.round((summary.total_paid / summary.total_rent_expected) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${(summary.total_paid / summary.total_rent_expected) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Expected: {formatCurrency(summary.total_rent_expected)}</span>
          <span>Remaining: {formatCurrency(summary.total_remaining)}</span>
        </div>
      </div>

      {/* Year Filter */}
      <div className="p-5 border-b bg-white">
        <label className="text-sm font-medium text-gray-700">Filter by Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="ml-3 px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">📅 All Years</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Monthly Breakdown */}
      <div className="divide-y">
        {filteredMonths.map((month, index) => (
          <div key={index} className="hover:bg-gray-50">
            <div 
              className="p-4 cursor-pointer flex items-center justify-between"
              onClick={() => toggleMonth(index)}
            >
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <p className="font-medium text-gray-800">{month.month_name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(month.monthly_rent)}</p>
                </div>
                <div>
                  {getStatusBadge(month.status)}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-green-600 font-medium">
                    Paid: {formatCurrency(month.paid_amount)}
                  </p>
                  {month.remaining_amount > 0 && (
                    <p className="text-xs text-red-500">
                      Remaining: {formatCurrency(month.remaining_amount)}
                    </p>
                  )}
                </div>
                <div className="w-32">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        month.status === 'paid' ? 'bg-green-500' :
                        month.status === 'partial' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(month.payment_percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {Math.round(month.payment_percentage)}%
                  </p>
                </div>
                {expandedMonths[index] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
            
            {/* Expanded Details */}
            {expandedMonths[index] && (
              <div className="bg-gray-50 p-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 Payment Details</h4>
                {month.payments.length > 0 ? (
                  <div className="space-y-2">
                    {month.payments.map((payment, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-2 flex justify-between items-center border">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✅ Paid</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No payments recorded for this month</p>
                )}
                {month.remaining_amount > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      ⚠️ Remaining: {formatCurrency(month.remaining_amount)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}