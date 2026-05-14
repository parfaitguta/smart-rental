// frontend/src/pages/auth/AdminLogin.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginUser } from '../../api/authApi'
import toast from 'react-hot-toast'
import { Shield, LogIn, Eye, EyeOff, AlertTriangle, Lock, Key, Server } from 'lucide-react'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

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
      
      // ADMIN ROLE VALIDATION - Only allow admin role
      if (userRole !== 'admin') {
        const roleNames = {
          landlord: 'Landlord',
          renter: 'Renter'
        }
        const errorMsg = `Access Denied! This is an Admin-only portal. This account is a ${roleNames[userRole]}.`
        setError(errorMsg)
        toast.error(errorMsg)
        setLoading(false)
        return
      }
      
      // Admin role match - proceed with login
      login(res.data.token, res.data.user)
      toast.success(`Welcome Admin, ${res.data.user.full_name}!`)
      navigate('/admin/dashboard')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Admin login failed'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      {/* Admin Background Pattern */}
      <div className="absolute inset-0 bg-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(#444_1px,transparent_1px)] bg-[length:24px_24px] opacity-20" />
      </div>
      
      <div className="relative z-10 bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
        {/* Admin Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-600/20 p-4 rounded-full border border-red-500/50">
            <Shield size={48} className="text-red-500" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Lock size={14} className="text-gray-400" />
            <p className="text-gray-400 text-sm">Secure Administrator Access Only</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg flex items-start gap-2">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@rental.rw"
                required
                autoComplete="off"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            <LogIn size={18} />
            {loading ? 'Verifying Admin Access...' : 'Access Admin Dashboard'}
          </button>
        </form>

        {/* Admin Info */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Server size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400">Authorized Personnel Only</p>
          </div>
          <p className="text-xs text-gray-500">
            This area is restricted to system administrators. Unauthorized access attempts are logged.
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-300 transition">
            ← Return to Homepage
          </Link>
        </div>
        
        <div className="mt-4 text-center">
          <Link to="/login" className="text-xs text-gray-600 hover:text-gray-400 transition">
            Regular user login?
          </Link>
        </div>
      </div>
      
      {/* Footer Note */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-gray-600">Smart Rental Admin Portal v1.0 | Secure Access Only</p>
      </div>
    </div>
  )
}