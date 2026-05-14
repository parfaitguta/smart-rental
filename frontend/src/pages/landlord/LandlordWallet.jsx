// frontend/src/pages/landlord/LandlordWallet.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Wallet, TrendingUp, TrendingDown, History, CreditCard, Phone, ArrowUpRight, CheckCircle, XCircle, Clock, X } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

export default function LandlordWallet() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawPhone, setWithdrawPhone] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('mtn_momo')
  const [submitting, setSubmitting] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [balanceRes, transactionsRes, withdrawalsRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/wallet/transactions'),
        api.get('/wallet/withdrawals')
      ])
      setWallet(balanceRes.data)
      setTransactions(transactionsRes.data.transactions || [])
      setWithdrawals(withdrawalsRes.data.withdrawals || [])
      console.log('Wallet balance:', balanceRes.data.balance)
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      toast.error('Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()

    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amount > wallet?.balance) {
      toast.error(`Insufficient balance. Maximum withdrawal: ${formatCurrency(wallet?.balance)}`)
      return
    }

    if (!withdrawPhone || withdrawPhone.length < 10) {
      toast.error('Please enter a valid phone number (e.g., 0788888888)')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.post('/wallet/withdraw', {
        amount: amount,
        phone: withdrawPhone,
        method: withdrawMethod
      })

      if (response.data.success) {
        toast.success('Withdrawal request submitted successfully!')
        setShowWithdrawModal(false)
        setWithdrawAmount('')
        setWithdrawPhone('')
        fetchData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"><CheckCircle size={12} /> Completed</span>
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"><Clock size={12} /> Pending</span>
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Processing</span>
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"><XCircle size={12} /> Failed</span>
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"><XCircle size={12} /> Cancelled</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{status}</span>
    }
  }

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardBgClass = darkMode ? 'bg-gray-800' : 'bg-white'
  const textColorClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-500'
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200'

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${bgClass}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgClass} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${textColorClass}`}>Wallet & Withdrawals</h1>
          <p className={`${textSecondaryClass} text-sm mt-1`}>Manage your earnings and withdrawals</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${cardBgClass} rounded-xl shadow-sm p-6 border ${borderClass}`}>
            <div className="flex items-center justify-between mb-4">
              <Wallet size={24} className="text-blue-500" />
              <span className="text-xs text-gray-500">Available Balance</span>
            </div>
            <p className={`text-3xl font-bold ${textColorClass}`}>{formatCurrency(wallet?.balance || 0)}</p>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={!wallet?.balance || wallet.balance <= 0}
              className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition ${
                !wallet?.balance || wallet.balance <= 0
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Withdraw Funds
            </button>
            {(!wallet?.balance || wallet.balance <= 0) && (
              <p className="text-xs text-center text-gray-400 mt-2">Add balance by receiving rent payments</p>
            )}
          </div>

          <div className={`${cardBgClass} rounded-xl shadow-sm p-6 border ${borderClass}`}>
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={24} className="text-green-500" />
              <span className="text-xs text-gray-500">Total Earned</span>
            </div>
            <p className={`text-3xl font-bold text-green-600`}>{formatCurrency(wallet?.total_earned || 0)}</p>
          </div>

          <div className={`${cardBgClass} rounded-xl shadow-sm p-6 border ${borderClass}`}>
            <div className="flex items-center justify-between mb-4">
              <TrendingDown size={24} className="text-red-500" />
              <span className="text-xs text-gray-500">Total Withdrawn</span>
            </div>
            <p className={`text-3xl font-bold text-red-600`}>{formatCurrency(wallet?.total_withdrawn || 0)}</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={`${cardBgClass} rounded-xl shadow-sm border ${borderClass} mb-8`}>
          <div className="p-4 border-b ${borderClass}">
            <h2 className={`text-lg font-semibold ${textColorClass} flex items-center gap-2`}>
              <History size={20} />
              Recent Transactions
            </h2>
          </div>
          <div className="divide-y ${borderClass}">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No transactions yet</div>
            ) : (
              transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className={`font-medium ${textColorClass}`}>
                      {tx.type === 'rent_payment' ? 'Rent Payment Received' : 'Withdrawal'}
                    </p>
                    <p className={`text-xs ${textSecondaryClass}`}>{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'rent_payment' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'rent_payment' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-500">Balance: {formatCurrency(tx.balance_after)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Withdrawal History */}
        <div className={`${cardBgClass} rounded-xl shadow-sm border ${borderClass}`}>
          <div className="p-4 border-b ${borderClass}">
            <h2 className={`text-lg font-semibold ${textColorClass} flex items-center gap-2`}>
              <CreditCard size={20} />
              Withdrawal History
            </h2>
          </div>
          <div className="divide-y ${borderClass}">
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No withdrawal requests yet</div>
            ) : (
              withdrawals.map((wd) => (
                <div key={wd.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className={`font-medium ${textColorClass}`}>{formatCurrency(wd.amount)}</p>
                    <p className={`text-xs ${textSecondaryClass}`}>{new Date(wd.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">Phone: {wd.phone}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(wd.status)}
                    {wd.processed_at && (
                      <p className="text-xs text-gray-500 mt-1">Processed: {new Date(wd.processed_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBgClass} rounded-xl max-w-md w-full p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${textColorClass}`}>Withdraw Funds</h2>
              <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className={`mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg`}>
              <p className="text-sm text-blue-600 dark:text-blue-400">Available Balance: {formatCurrency(wallet?.balance)}</p>
            </div>

            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Amount (RWF)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                  required
                  min="1"
                  max={wallet?.balance}
                />
                <p className="text-xs text-gray-400 mt-1">Min: RWF 100 | Max: {formatCurrency(wallet?.balance)}</p>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Phone Number</label>
                <input
                  type="tel"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="0788888888"
                  className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Enter MTN or Airtel registered phone number</p>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Payment Method</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('mtn_momo')}
                    className={`flex-1 py-2 rounded-lg border ${
                      withdrawMethod === 'mtn_momo'
                        ? 'bg-yellow-400 border-yellow-500 text-yellow-900'
                        : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'}`
                    }`}
                  >
                    📱 MTN MoMo
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('airtel_money')}
                    className={`flex-1 py-2 rounded-lg border ${
                      withdrawMethod === 'airtel_money'
                        ? 'bg-red-500 border-red-600 text-white'
                        : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'}`
                    }`}
                  >
                    📱 Airtel Money
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg mb-4">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  ⚠️ Withdrawal requests are processed within 24 hours. Money will be sent to your mobile money.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}