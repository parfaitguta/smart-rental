// frontend/src/pages/auth/VerifyOTP.jsx
import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { verifyOtp, resendOtp } from '../../api/authApi'
import toast from 'react-hot-toast'
import { ShieldCheck, RefreshCw } from 'lucide-react'

const VERIFY_EMAIL_KEY = 'verifyOtpEmail'

function readEmailFromStateOrStorage(location) {
  const fromState = location.state?.email
  if (fromState != null && String(fromState).trim()) {
    const e = String(fromState).trim()
    sessionStorage.setItem(VERIFY_EMAIL_KEY, e)
    return e
  }
  const stored = sessionStorage.getItem(VERIFY_EMAIL_KEY)
  return stored ? stored.trim() : ''
}

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputs = useRef([])
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(() => readEmailFromStateOrStorage(location))

  useEffect(() => {
    const next = readEmailFromStateOrStorage(location)
    if (next) setEmail(next)
  }, [location.state, location.key])

  useEffect(() => {
    if (!email) navigate('/register')
  }, [email, navigate])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6).split('')
    if (pasted.every(c => /\d/.test(c))) {
      setOtp([...pasted, ...Array(6 - pasted.length).fill('')])
      inputs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const res = await verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otpCode
      })
      sessionStorage.removeItem(VERIFY_EMAIL_KEY)
      login(res.data.token, res.data.user)
      toast.success('Account verified! Welcome!')
      const role = res.data.user.role
      if (role === 'landlord') navigate('/landlord/dashboard')
      else if (role === 'admin') navigate('/admin/dashboard')
      else navigate('/search')
    } catch (err) {
      const msg =
        err.code === 'ECONNABORTED'
          ? 'Request timed out. Try again in a moment.'
          : err.response?.data?.message || 'Invalid OTP'
      toast.error(msg)
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await resendOtp({ email: email.trim().toLowerCase() })
      toast.success('New OTP sent to your email!')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } catch (err) {
      const msg =
        err.code === 'ECONNABORTED'
          ? 'Request timed out. Try again in a moment.'
          : err.response?.data?.message || 'Failed to resend OTP'
      toast.error(msg)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <ShieldCheck size={32} className="text-blue-700" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Verify Your Account</h1>
          <p className="text-gray-500 text-sm mt-1">We sent a 6-digit code to</p>
          <p className="text-blue-600 font-medium text-sm">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  digit ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <ShieldCheck size={18} />
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          {countdown > 0 ? (
            <p className="text-gray-400 text-sm">
              Resend OTP in <span className="text-blue-600 font-medium">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mx-auto disabled:opacity-60"
            >
              <RefreshCw size={14} />
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Wrong email?{' '}
          <Link
            to="/register"
            className="text-blue-600 hover:underline"
            onClick={() => sessionStorage.removeItem(VERIFY_EMAIL_KEY)}
          >
            Go back
          </Link>
        </p>
      </div>
    </div>
  )
}
