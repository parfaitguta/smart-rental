// frontend/src/pages/auth/Login.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginUser } from '../../api/authApi'
import toast from 'react-hot-toast'
import { Home, LogIn, Eye, EyeOff, UserCircle, Building, AlertCircle, Shield } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
  }, [])

  useEffect(() => {
    if (roleParam && ['renter', 'landlord'].includes(roleParam)) {
      setSelectedRole(roleParam)
      setError('')
      if (roleParam === 'landlord') {
        setForm(prev => ({ ...prev, email: 'alice@gmail.com' }))
      } else if (roleParam === 'renter') {
        setForm(prev => ({ ...prev, email: 'jean@gmail.com' }))
      }
    }
  }, [roleParam])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await loginUser(form)
      const userRole = res.data.user.role
      const expectedRole = selectedRole || 'renter'
      
      if (userRole === 'admin') {
        const errorMsg = 'Access Denied! Administrators must use the Admin Portal.'
        setError(errorMsg)
        toast.error(errorMsg)
        setLoading(false)
        return
      }
      
      if (expectedRole !== userRole) {
        const roleNames = {
          landlord: 'Landlord',
          renter: 'Renter'
        }
        const errorMsg = `Access Denied! This account is a ${roleNames[userRole]}. Please login as ${roleNames[userRole]}.`
        setError(errorMsg)
        toast.error(errorMsg)
        setLoading(false)
        return
      }
      
      login(res.data.token, res.data.user)
      toast.success(`Welcome back, ${res.data.user.full_name}!`)
      
      if (userRole === 'landlord') navigate('/landlord/dashboard')
      else navigate('/search')
      
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        toast.error('Please verify your account first')
        const email = form.email.trim()
        sessionStorage.setItem('verifyOtpEmail', email)
        navigate('/verify-otp', { state: { email } })
      } else {
        const errorMessage = err.response?.data?.message || 'Login failed'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const getRoleInfo = () => {
    switch (selectedRole) {
      case 'landlord':
        return { icon: Building, title: 'Landlord Login', subtitle: 'Manage your properties', color: 'purple' }
      default:
        return { icon: UserCircle, title: 'Renter Login', subtitle: 'Find your perfect home', color: 'blue' }
    }
  }

  const roleInfo = getRoleInfo()
  const RoleIcon = roleInfo.icon

  const bgClass = darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-700 to-blue-900'
  const cardBgClass = darkMode ? 'bg-gray-800' : 'bg-white'
  const textColorClass = darkMode ? 'text-white' : 'text-gray-800'
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputBgClass = darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
  const inputFocusClass = darkMode ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
  const roleButtonClass = darkMode ? 'bg-gray-700 hover:bg-gray-600' : ''
  const demoTextClass = darkMode ? 'text-gray-500' : 'text-gray-400'

  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center px-4`}>
      <div className={`${cardBgClass} rounded-2xl shadow-2xl w-full max-w-md p-8`}>
        {selectedRole && (
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
            roleInfo.color === 'purple' 
              ? (darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700')
              : (darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700')
          }`}>
            <RoleIcon size={14} />
            {roleInfo.title}
          </div>
        )}

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className={`p-3 rounded-full ${
              roleInfo.color === 'purple' 
                ? (darkMode ? 'bg-purple-900' : 'bg-purple-100')
                : (darkMode ? 'bg-blue-900' : 'bg-blue-100')
            }`}>
              <Home size={32} className={`${
                roleInfo.color === 'purple' 
                  ? (darkMode ? 'text-purple-400' : 'text-purple-700')
                  : (darkMode ? 'text-blue-400' : 'text-blue-700')
              }`} />
            </div>
          </div>
          <h1 className={`text-2xl font-bold ${textColorClass}`}>Smart Rental RW</h1>
          <p className={`${textSecondaryClass} text-sm mt-1`}>{roleInfo.subtitle}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${inputBgClass} ${inputFocusClass}`}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 text-xs hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 pr-10 ${inputBgClass} ${inputFocusClass}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              roleInfo.color === 'purple' 
                ? 'bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700' 
                : 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
            } text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60`}
          >
            <LogIn size={18} />
            {loading ? 'Signing in...' : `Sign in as ${roleInfo.title}`}
          </button>
        </form>

        {!selectedRole && (
          <div className={`mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs text-center ${textSecondaryClass} mb-3`}>Sign in as:</p>
            <div className="flex gap-3">
              <Link
                to="/login?role=renter"
                className={`flex-1 text-center text-sm py-2 px-3 rounded-lg transition ${
                  darkMode 
                    ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                🏠 Renter
              </Link>
              <Link
                to="/login?role=landlord"
                className={`flex-1 text-center text-sm py-2 px-3 rounded-lg transition ${
                  darkMode 
                    ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' 
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                🏢 Landlord
              </Link>
            </div>
          </div>
        )}

        <div className="mt-4 pt-2">
          <p className={`text-xs text-center ${demoTextClass}`}>Demo Accounts (password: password123)</p>
          <div className="flex justify-center gap-4 text-xs text-center mt-1">
            <p className={demoTextClass}>🏢 Landlord: alice@gmail.com</p>
            <p className={demoTextClass}>🏠 Renter: jean@gmail.com</p>
          </div>
        </div>

        <p className={`mt-6 text-center text-sm ${textSecondaryClass}`}>
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Register</Link>
        </p>

        <div className={`mt-4 text-center border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} pt-4`}>
          <Link to="/admin-login" className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition flex items-center justify-center gap-1">
            <Shield size={12} />
            Admin Portal
          </Link>
        </div>

        <div className="mt-3 text-center">
          <Link to="/" className={`text-xs ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'} transition`}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}