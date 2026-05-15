// backend/src/config/email.js
import dotenv from 'dotenv'
dotenv.config()

// Use Brevo's REST API directly with fetch (no SDK needed)
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3'

export const sendOTPEmail = async (toEmail, otp, userName) => {
  try {
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not set in environment variables')
    }

    console.log(`📧 Sending OTP to ${toEmail} via Brevo API...`)

    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'Smart Rental RW',
          email: process.env.EMAIL_FROM || 'tuyisabeparfait888@gmail.com'
        },
        to: [{ email: toEmail, name: userName }],
        subject: 'Smart Rental RW — Verify Your Account',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">🏠 Smart Rental RW</h1>
            </div>
            <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1f2937;">Verify Your Account</h2>
              <p style="color: #6b7280;">Hello <strong>${userName}</strong>, welcome to Smart Rental RW!</p>
              <p style="color: #6b7280;">Use the OTP below to verify your account:</p>
              <div style="text-align: center; margin: 32px 0;">
                <div style="background: #1d4ed8; color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px 32px; border-radius: 12px; display: inline-block;">
                  ${otp}
                </div>
              </div>
              <p style="color: #9ca3af; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="color: #d1d5db; font-size: 12px; text-align: center;">Smart Rental Management System — Rwanda</p>
            </div>
          </div>
        `
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Brevo API error details:', data)
      throw new Error(data.message || 'Failed to send email')
    }
    
    console.log('✅ OTP email sent via Brevo API:', data.messageId)
    return data
  } catch (error) {
    console.error('❌ Brevo API error:', error.message)
    throw error
  }
}

export const sendResetEmail = async (toEmail, resetUrl, userName) => {
  try {
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not set in environment variables')
    }

    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'Smart Rental RW',
          email: process.env.EMAIL_FROM || 'tuyisabeparfait888@gmail.com'
        },
        to: [{ email: toEmail, name: userName }],
        subject: 'Smart Rental RW — Password Reset Request',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">🏠 Smart Rental RW</h1>
            </div>
            <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1f2937;">Password Reset Request</h2>
              <p style="color: #6b7280;">Hello <strong>${userName}</strong>,</p>
              <p style="color: #6b7280;">Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background: #1d4ed8; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Reset My Password
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 13px;">This link expires in <strong>1 hour</strong>.</p>
              <p style="color: #9ca3af; font-size: 13px;">If you didn't request this, ignore this email.</p>
            </div>
          </div>
        `
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Brevo API error details:', data)
      throw new Error(data.message || 'Failed to send reset email')
    }
    
    console.log('✅ Reset email sent via Brevo API:', data.messageId)
    return data
  } catch (error) {
    console.error('❌ Brevo API error:', error.message)
    throw error
  }
}