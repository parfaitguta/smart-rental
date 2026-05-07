import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { getRentalPaymentHistory } from '../../api/invoiceApi'
import { formatCurrency, formatDate } from '../../utils/helpers'
import Spinner from './Spinner'

export default function PaymentHistoryModal({ rental, isOpen, onClose }) {
  const [paymentData, setPaymentData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && rental) {
      fetchPaymentHistory()
    }
  }, [isOpen, rental]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPaymentHistory = async () => {
    try {
      const res = await getRentalPaymentHistory(rental.id)
      setPaymentData(res.data)
    } catch (err) {
      console.error('Error fetching payment history:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
            <p className="text-sm text-gray-500">{rental?.property_title}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <Spinner size="lg" />
          ) : paymentData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-blue-600 text-xs">Total Months</p>
                  <p className="text-2xl font-bold">{paymentData.summary?.total_months || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-green-600 text-xs">Paid Months</p>
                  <p className="text-2xl font-bold">{paymentData.summary?.paid_months || 0}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-yellow-600 text-xs">Partial Months</p>
                  <p className="text-2xl font-bold">{paymentData.summary?.partial_months || 0}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-red-600 text-xs">Total Remaining</p>
                  <p className="text-2xl font-bold">{formatCurrency(paymentData.summary?.total_remaining || 0)}</p>
                </div>
              </div>

              {/* Monthly Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Month</th>
                      <th className="px-4 py-2 text-right">Rent</th>
                      <th className="px-4 py-2 text-right">Paid</th>
                      <th className="px-4 py-2 text-right">Remaining</th>
                      <th className="px-4 py-2 text-center">Status</th>
                      <th className="px-4 py-2 text-center">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paymentData.payment_history?.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{inv.month_year}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(inv.amount)}</td>
                        <td className="px-4 py-3 text-right text-green-600">{formatCurrency(inv.total_paid)}</td>
                        <td className="px-4 py-3 text-right text-red-600">{formatCurrency(inv.remaining_due)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                            inv.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, inv.payment_percentage)}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Payments */}
              {paymentData.all_payments?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-700 mb-3">Recent Transactions</h3>
                  <div className="space-y-2">
                    {paymentData.all_payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{payment.month_year}</p>
                          <p className="text-xs text-gray-500">{formatDate(payment.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-gray-500 capitalize">{payment.method}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">No payment history found</p>
          )}
        </div>
      </div>
    </div>
  )
}