// backend/src/controllers/authController.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import pool from '../config/db.js'
import { createUser, findUserByEmail, findUserById } from '../models/userModel.js'
import { sendResetEmail, sendOTPEmail } from '../config/email.js'
import { LOG } from '../utils/activityLogger.js'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body

    if (!full_name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    const userId = await createUser({ full_name, email, phone, password_hash, role })

    await pool.query(
      'UPDATE users SET otp_code = ?, otp_expires = ?, is_verified = FALSE WHERE id = ?',
      [otp, otpExpires, userId]
    )

    try {
      await sendOTPEmail(email, otp, full_name)
      console.log(`✅ OTP sent to ${email} — Code: ${otp}`)
    } catch (emailError) {
      console.error('❌ OTP email failed:', emailError.message)
    }

    await LOG.register(userId, req.ip)

    res.status(201).json({
      message: 'Account created! Please check your email for the OTP verification code.',
      userId,
      email
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' })
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND otp_code = ? AND otp_expires > NOW()',
      [email, otp]
    )

    if (!users[0]) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    await pool.query(
      'UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires = NULL WHERE id = ?',
      [users[0].id]
    )

    const token = generateToken(users[0].id)
    const user = await findUserById(users[0].id)

    res.json({ message: 'Account verified successfully!', token, user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.is_verified) {
      return res.status(400).json({ message: 'Account is already verified' })
    }

    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    await pool.query(
      'UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?',
      [otp, otpExpires, user.id]
    )

    try {
      await sendOTPEmail(email, otp, user.full_name)
      console.log(`✅ OTP resent to ${email} — Code: ${otp}`)
    } catch (emailError) {
      console.error('❌ Resend OTP failed:', emailError.message)
    }

    res.json({ message: 'New OTP sent to your email' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (!user.is_verified) {
      return res.status(403).json({
        message: 'Account not verified. Please check your email for the OTP.',
        needsVerification: true,
        email: user.email
      })
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user.id)
    await LOG.login(user.id, req.ip)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.json({ message: 'If this email exists, a reset link has been sent' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000)

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetTokenExpires, user.id]
    )

    // ✅ FIXED: Use FRONTEND_URL from environment variable instead of localhost
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    console.log(`🔗 Reset URL: ${resetUrl}`); // Debug log

    try {
      await sendResetEmail(user.email, resetUrl, user.full_name)
      console.log(`✅ Reset email sent to ${user.email}`)
    } catch (emailError) {
      console.error('❌ Reset email failed:', emailError.message)
    }

    res.json({ message: 'If this email exists, a reset link has been sent' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    )

    if (!users[0]) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    const password_hash = await bcrypt.hash(password, 12)

    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [password_hash, users[0].id]
    )

    res.json({ message: 'Password reset successfully. You can now login.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id)
    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body

    if (!full_name || !phone) {
      return res.status(400).json({ message: 'Full name and phone are required' })
    }

    await pool.query(
      'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
      [full_name, phone, req.user.id]
    )

    await LOG.profileUpdated(req.user.id, req.ip)

    const user = await findUserById(req.user.id)
    res.json({ message: 'Profile updated successfully', user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body

    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'Both current and new password are required' })
    }
    if (new_password.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }

    const user = await findUserByEmail(req.user.email)
    const isMatch = await bcrypt.compare(current_password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    const password_hash = await bcrypt.hash(new_password, 12)
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [password_hash, req.user.id]
    )

    await LOG.passwordChanged(req.user.id, req.ip)

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}