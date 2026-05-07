import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyProperties } from '../../api/propertyApi'
import { getLandlordRequests } from '../../api/requestApi'
import { getLandlordRentals } from '../../api/rentalApi'
import { getPaymentSummary } from '../../api/paymentApi'
import Spinner from '../../components/common/Spinner'
import { Building2, FileText, Home, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [props, reqs, rentals, summary] = await Promise.all([
          getMyProperties(),
          getLandlordRequests(),
          getLandlordRentals(),
          getPaymentSummary()
        ])
        setStats({
          properties: props.data.count,
          pendingRequests: reqs.data.requests.filter(r => r.status === 'pending').length,
          activeRentals: rentals.data.rentals.filter(r => r.status === 'active').length,
          totalReceived: summary.data.summary.total_received,
          totalOverdue: summary.data.summary.total_overdue,
          overdueCount: summary.data.summary.overdue_count
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <Spinner size="lg" />

  const cards = [
    { label: 'My Properties', value: stats.properties, icon: <Building2 size={24} />, color: 'bg-blue-500', link: '/landlord/properties' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: <FileText size={24} />, color: 'bg-yellow-500', link: '/landlord/requests' },
    { label: 'Active Rentals', value: stats.activeRentals, icon: <Home size={24} />, color: 'bg-green-500', link: '/landlord/rentals' },
    { label: 'Total Income', value: formatCurrency(stats.totalReceived), icon: <TrendingUp size={24} />, color: 'bg-purple-500', link: '/landlord/payments' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Landlord Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your rental properties</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} to={card.link}
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`${card.color} text-white p-3 rounded-xl`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-gray-800">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Overdue Alert */}
      {stats.overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <div>
            <p className="text-red-700 font-medium">Overdue Payments Alert</p>
            <p className="text-red-500 text-sm">
              You have {stats.overdueCount} overdue payment(s) totalling {formatCurrency(stats.totalOverdue)}.
              <Link to="/landlord/payments" className="underline ml-1 font-medium">View payments</Link>
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/landlord/properties/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Building2 size={16} /> Add New Property
          </Link>
          <Link to="/landlord/requests"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <FileText size={16} /> View Requests
          </Link>
          <Link to="/landlord/payments"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <CreditCard size={16} /> Record Payment
          </Link>
        </div>
      </div>
    </div>
  )
}