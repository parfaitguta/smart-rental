import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import {
  LayoutDashboard, Building2, Search, FileText,
  CreditCard, Users, Home, MessageSquare,
  User, Star, Activity
} from 'lucide-react'

const Sidebar = () => {
  const { user } = useAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetchUnread = async () => {
      try {
        const res = await api.get('/messages/unread')
        setUnreadMessages(res.data.count)
      } catch (err) {}
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [user])

  const renterLinks = [
    { to: '/search', icon: <Search size={18} />, label: 'Search Houses' },
    { to: '/my-requests', icon: <FileText size={18} />, label: 'My Requests' },
    { to: '/my-rentals', icon: <Home size={18} />, label: 'My Rentals' },
    { to: '/my-invoices', icon: <CreditCard size={18} />, label: 'My Invoices' },
    { to: '/my-reviews', icon: <Star size={18} />, label: 'My Reviews' },
    { to: '/my-activity', icon: <Activity size={18} />, label: 'My Activity' },
    { to: '/profile', icon: <User size={18} />, label: 'My Profile' },
  ]

  const landlordLinks = [
    { to: '/landlord/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/landlord/properties', icon: <Building2 size={18} />, label: 'My Properties' },
    { to: '/landlord/requests', icon: <FileText size={18} />, label: 'Rental Requests' },
    { to: '/landlord/rentals', icon: <Home size={18} />, label: 'Rentals' },
    { to: '/landlord/tenants', icon: <Users size={18} />, label: 'My Tenants' },
    { to: '/landlord/payments', icon: <CreditCard size={18} />, label: 'Payments' },
    { to: '/landlord/reviews', icon: <Star size={18} />, label: 'Reviews' },
    { to: '/my-activity', icon: <Activity size={18} />, label: 'My Activity' },
    { to: '/profile', icon: <User size={18} />, label: 'My Profile' },
  ]

  const adminLinks = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/admin/users', icon: <Users size={18} />, label: 'Users' },
    { to: '/admin/properties', icon: <Building2 size={18} />, label: 'Properties' },
    { to: '/admin/activity', icon: <Activity size={18} />, label: 'Activity Log' },
    { to: '/my-activity', icon: <Activity size={18} />, label: 'My Activity' },
    { to: '/profile', icon: <User size={18} />, label: 'My Profile' },
  ]

  const links = user?.role === 'landlord' ? landlordLinks
    : user?.role === 'admin' ? adminLinks
    : renterLinks

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-gray-300 flex flex-col py-6 px-3">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 hover:text-white'
            }`
          }
        >
          {link.icon}
          {link.label}
        </NavLink>
      ))}

      {/* Messages with unread badge */}
      <NavLink
        to="/messages"
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
            isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 hover:text-white'
          }`
        }
      >
        <MessageSquare size={18} />
        Messages
        {unreadMessages > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadMessages > 9 ? '9+' : unreadMessages}
          </span>
        )}
      </NavLink>
    </aside>
  )
}

export default Sidebar